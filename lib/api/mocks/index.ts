import { ApiError } from "../client";
import type {
  CancelResult,
  Deal,
  DealDetail,
  Order,
  OrderDetail,
  Paginated,
  Pledge,
  RefreshResult,
  RequestOtpResult,
  TimelineStep,
  TopupResult,
  User,
  VerifyOtpResult,
} from "../types";
import {
  buildDealDetail,
  buildDeliveries,
  buildDeals,
  buildOrders,
  buildReferral,
  buildTransactions,
  buildUser,
  buildWallet,
  categories,
  zones,
} from "./data";

// ---- Mutable in-memory state (resets on full reload) -----------------------

const deals = buildDeals();
let wallet = buildWallet();
let transactions = buildTransactions();
let orders = buildOrders();
const deliveries = buildDeliveries();
let user = buildUser();
const pledges = new Map<string, Pledge>();
let seq = 100;
const nextId = (prefix: string) => `${prefix}${++seq}`;

const MOCK_DELIVERY_FEE = 35000;
const MIN_TOPUP = 50000;

const delay = (ms = 320) => new Promise((r) => setTimeout(r, ms));

type Params = Record<string, string | number | boolean | undefined | null>;

function paginate<T>(items: T[], params?: Params): Paginated<T> {
  const page = Number(params?.page ?? 1);
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const slice = items.slice(start, start + pageSize);
  return {
    results: slice,
    count: items.length,
    next: start + pageSize < items.length ? `?page=${page + 1}` : null,
    previous: page > 1 ? `?page=${page - 1}` : null,
  };
}

function notFound(): never {
  throw new ApiError("not_found", "موردی پیدا نشد.", 404);
}

function sortDeals(list: Deal[], sort?: string): Deal[] {
  const copy = [...list];
  if (sort === "savings") copy.sort((a, b) => b.savings_percent - a.savings_percent);
  else if (sort === "popular")
    copy.sort((a, b) => b.participant_count - a.participant_count);
  else
    copy.sort(
      (a, b) =>
        new Date(a.lock_deadline).getTime() - new Date(b.lock_deadline).getTime(),
    );
  return copy;
}

function timelineFor(status: Order["status"]): TimelineStep[] {
  const order: Order["status"][] = [
    "joined",
    "locked",
    "preparing",
    "out_for_delivery",
    "delivered",
  ];
  const idx = order.indexOf(status);
  return order.map((state, i) => ({
    state,
    at: i <= idx ? new Date(Date.now() - (idx - i) * 86_400_000).toISOString() : null,
    done: i <= idx,
  }));
}

function makePledge(deal: Deal, quantity: number): Pledge {
  const goods = deal.wholesale_price * quantity;
  return {
    id: nextId("p"),
    deal_id: deal.id,
    quantity,
    unit_price: deal.wholesale_price,
    goods_total: goods,
    estimated_delivery_fee: MOCK_DELIVERY_FEE,
    total_locked: goods + MOCK_DELIVERY_FEE,
    status: "active",
    is_volume_champion: false,
    grace_until: new Date(Date.now() + 3600_000).toISOString(),
    created_at: new Date().toISOString(),
  };
}

// ---- Dispatcher ------------------------------------------------------------

export async function mockDispatch<T>(
  method: string,
  path: string,
  body?: unknown,
  params?: Params,
): Promise<T> {
  await delay();
  const b = (body ?? {}) as Record<string, unknown>;
  const seg = path.split("?")[0].split("/").filter(Boolean); // e.g. ["deals","d1","join"]

  const route = `${method} /${seg.join("/")}`;

  // --- Auth ---
  if (route === "POST /auth/request-otp")
    return { sent: true, expires_in: 120 } satisfies RequestOtpResult as T;

  if (route === "POST /auth/verify-otp") {
    // Use code "000000" to simulate a brand-new user (-> onboarding).
    const isNew = b.code === "000000";
    const u: User = isNew
      ? { ...buildUser(), full_name: "", zone: null, address: "", address_pin: null }
      : user;
    user = u;
    return {
      access: "mock-access-token",
      refresh: "mock-refresh-token",
      user: u,
      is_new: isNew,
    } satisfies VerifyOtpResult as T;
  }

  if (route === "POST /auth/refresh")
    return { access: "mock-access-token" } satisfies RefreshResult as T;

  // --- User ---
  if (route === "GET /me") return user as T;
  if (route === "PATCH /me") {
    if (typeof b.zone_id === "string") {
      user = { ...user, zone: zones.find((z) => z.id === b.zone_id) ?? user.zone };
    }
    const { zone_id: _zone, ...rest } = b;
    void _zone;
    user = { ...user, ...(rest as Partial<User>) };
    return user as T;
  }
  if (route === "GET /me/referral") return buildReferral() as T;
  if (route === "GET /me/deliveries") return deliveries as T;

  // --- Wallet ---
  if (route === "GET /wallet") return wallet as T;
  if (route === "GET /wallet/transactions")
    return paginate(transactions, params) as T;
  if (route === "POST /wallet/topup") {
    const amount = Number(b.amount);
    if (!amount || amount < MIN_TOPUP)
      throw new ApiError(
        "invalid_amount",
        "حداقل مبلغ شارژ ۵۰,۰۰۰ تومان است.",
        400,
      );
    return {
      redirect_url: `${process.env.NEXT_PUBLIC_ZARINPAL_RETURN_URL ?? "/"}?status=OK&amount=${amount}`,
      payment_id: nextId("pay"),
    } satisfies TopupResult as T;
  }

  // --- Catalog ---
  if (route === "GET /categories") return categories as T;
  if (route === "GET /zones") return zones as T;

  if (route === "GET /deals") {
    let list = deals;
    if (params?.category)
      list = list.filter((d) => d.product.category.id === params.category);
    if (params?.status) list = list.filter((d) => d.status === params.status);
    list = sortDeals(list, params?.sort ? String(params.sort) : undefined);
    return paginate(list, params) as T;
  }

  // --- Deal detail / actions ---
  if (seg[0] === "deals" && seg.length === 2 && method === "GET") {
    const deal = deals.find((d) => d.id === seg[1]);
    if (!deal) notFound();
    return buildDealDetail(deal) as DealDetail as T;
  }

  if (seg[0] === "deals" && seg[2] === "join" && method === "POST") {
    const idx = deals.findIndex((d) => d.id === seg[1]);
    if (idx === -1) notFound();
    const quantity = Math.max(1, Number(b.quantity) || 1);
    const deal = deals[idx];
    const pledge = makePledge(deal, quantity);
    pledges.set(pledge.id, pledge);
    // reflect in deal, wallet, orders
    deals[idx] = {
      ...deal,
      units_pledged: deal.units_pledged + quantity,
      participant_count: deal.my_pledge
        ? deal.participant_count
        : deal.participant_count + 1,
      my_pledge: { quantity: (deal.my_pledge?.quantity ?? 0) + quantity },
    };
    wallet = {
      ...wallet,
      available: wallet.available - pledge.total_locked,
      locked: wallet.locked + pledge.total_locked,
    };
    transactions = [
      {
        id: nextId("t"),
        type: "lock",
        amount: -pledge.total_locked,
        balance_after: wallet.available,
        description: `قفل وجه برای دیل ${deal.product.name}`,
        created_at: new Date().toISOString(),
      },
      ...transactions,
    ];
    orders = [
      {
        id: nextId("o"),
        deal: deals[idx],
        quantity,
        status: "joined",
        total_locked: pledge.total_locked,
        delivery: null,
      },
      ...orders,
    ];
    return pledge as T;
  }

  // --- Pledges ---
  if (seg[0] === "pledges" && seg[2] === "update" && method === "POST") {
    const pledge = pledges.get(seg[1]);
    if (!pledge) notFound();
    const quantity = Math.max(1, Number(b.quantity) || pledge.quantity);
    const goods = pledge.unit_price * quantity;
    const updated: Pledge = {
      ...pledge,
      quantity,
      goods_total: goods,
      total_locked: goods + pledge.estimated_delivery_fee,
    };
    pledges.set(pledge.id, updated);
    return updated as T;
  }

  if (seg[0] === "pledges" && seg[2] === "cancel" && method === "POST") {
    const pledge = pledges.get(seg[1]);
    if (!pledge) notFound();
    pledges.delete(pledge.id);
    wallet = {
      ...wallet,
      available: wallet.available + pledge.total_locked,
      locked: Math.max(0, wallet.locked - pledge.total_locked),
    };
    return { ok: true, refunded: pledge.total_locked } satisfies CancelResult as T;
  }

  // --- Orders ---
  if (route === "GET /orders") return orders as T;
  if (seg[0] === "orders" && seg.length === 2 && method === "GET") {
    const order = orders.find((o) => o.id === seg[1]);
    if (!order) notFound();
    return { ...order, timeline: timelineFor(order.status) } as OrderDetail as T;
  }

  // --- Deliveries ---
  if (seg[0] === "deliveries" && seg.length === 2 && method === "GET") {
    const dl = deliveries.find((d) => d.id === seg[1]);
    if (!dl) notFound();
    return dl as T;
  }

  throw new ApiError("not_implemented", `مسیر ماک تعریف نشده: ${route}`, 404);
}
