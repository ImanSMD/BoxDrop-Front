// Mock fixtures for offline / standalone development (NEXT_PUBLIC_USE_MOCKS=true).
// Shapes mirror CLAUDE.md §8; content echoes the master mockup.

import type {
  Category,
  Deal,
  DealDetail,
  Delivery,
  Order,
  Referral,
  User,
  Wallet,
  WalletTransaction,
  Zone,
} from "../types";

const hoursFromNow = (h: number) => new Date(Date.now() + h * 3600_000).toISOString();
const daysFromNow = (d: number) => new Date(Date.now() + d * 86_400_000).toISOString();
const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000).toISOString();
const daysAgo = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();

export const categories: Category[] = [
  { id: "drinks", name: "نوشیدنی", emoji: "🥤" },
  { id: "snacks", name: "خوراکی", emoji: "🍫" },
  { id: "home", name: "خانه و آشپزخانه", emoji: "🏠" },
  { id: "cleaning", name: "شوینده", emoji: "🧴" },
  { id: "dairy", name: "لبنیات", emoji: "🥛" },
];

export const zones: Zone[] = [
  { id: "vanak", name: "ونک" },
  { id: "ponak", name: "پونک" },
  { id: "niavaran", name: "نیاوران" },
  { id: "saadatabad", name: "سعادت‌آباد" },
  { id: "jordan", name: "جردن" },
];

const cat = (id: string) => categories.find((c) => c.id === id)!;

const savings = (retail: number, wholesale: number) =>
  Math.round(((retail - wholesale) / retail) * 100);

export function buildDeals(): Deal[] {
  return [
    {
      id: "d1",
      product: {
        name: "آبجو مالت ساده",
        emoji: "🍺",
        image_url: null,
        category: cat("drinks"),
      },
      box_size: 12,
      units_pledged: 9,
      wholesale_price: 17000,
      retail_reference: 24000,
      savings_percent: savings(24000, 17000),
      status: "open",
      opens_at: daysAgo(2),
      lock_deadline: hoursFromNow(6),
      extended_deadline: null,
      participant_count: 7,
      participant_avatars: ["ع", "س", "ر", "م"],
      tier: "silver",
      zone: zones[0],
      my_pledge: null,
    },
    {
      id: "d2",
      product: {
        name: "شکلات تلخ ۸۵٪",
        emoji: "🍫",
        image_url: null,
        category: cat("snacks"),
      },
      box_size: 20,
      units_pledged: 4,
      wholesale_price: 32000,
      retail_reference: 45000,
      savings_percent: savings(45000, 32000),
      status: "open",
      opens_at: daysAgo(1),
      lock_deadline: hoursFromNow(28),
      extended_deadline: null,
      participant_count: 3,
      participant_avatars: ["ز", "ن"],
      tier: "bronze",
      zone: zones[3],
      my_pledge: null,
    },
    {
      id: "d3",
      product: {
        name: "مایع ظرفشویی ۴ لیتری",
        emoji: "🧴",
        image_url: null,
        category: cat("cleaning"),
      },
      box_size: 6,
      units_pledged: 6,
      wholesale_price: 95000,
      retail_reference: 140000,
      savings_percent: savings(140000, 95000),
      status: "open",
      opens_at: daysAgo(3),
      lock_deadline: hoursFromNow(2),
      extended_deadline: null,
      participant_count: 6,
      participant_avatars: ["ک", "ه", "ب", "ت", "ف"],
      tier: "gold",
      zone: zones[1],
      my_pledge: { quantity: 2 },
    },
    {
      id: "d4",
      product: {
        name: "ماست موسیر ۹۰۰ گرمی",
        emoji: "🥛",
        image_url: null,
        category: cat("dairy"),
      },
      box_size: 10,
      units_pledged: 5,
      wholesale_price: 48000,
      retail_reference: 62000,
      savings_percent: savings(62000, 48000),
      status: "open",
      opens_at: daysAgo(1),
      lock_deadline: hoursFromNow(40),
      extended_deadline: null,
      participant_count: 5,
      participant_avatars: ["د", "ج", "ل"],
      tier: "silver",
      zone: zones[2],
      my_pledge: null,
    },
    {
      id: "d5",
      product: {
        name: "قهوه اسپرسو ۲۵۰ گرمی",
        emoji: "☕",
        image_url: null,
        category: cat("drinks"),
      },
      box_size: 15,
      units_pledged: 11,
      wholesale_price: 120000,
      retail_reference: 165000,
      savings_percent: savings(165000, 120000),
      status: "open",
      opens_at: daysAgo(2),
      lock_deadline: hoursFromNow(14),
      extended_deadline: null,
      participant_count: 9,
      participant_avatars: ["ا", "م", "ص", "پ", "و"],
      tier: "silver",
      zone: zones[0],
      my_pledge: null,
    },
  ];
}

export function buildDealDetail(deal: Deal): DealDetail {
  const b = Math.max(3, Math.round(deal.box_size * 0.4));
  const s = Math.max(b + 1, Math.round(deal.box_size * 0.75));
  return {
    ...deal,
    description:
      "این محصول مستقیم از تأمین‌کننده تهیه می‌شود. وقتی به سقف جعبه برسیم، قیمت عمده برای همه قفل می‌شود و سفارش‌ها با مسیر مشترک پیک ارسال می‌گردد.",
    tiers: [
      { level: "bronze", threshold: b, label: "گرم شدن" },
      { level: "silver", threshold: s, label: "داغ شد" },
      { level: "gold", threshold: deal.box_size, label: "آنلاک عمده" },
    ],
    rewards: { volume_champion_pct: 3, referral_pct: 2 },
    estimated_delivery_fee: 35000,
    supplier: { business_name: "پخش مرکزی تهران" },
  };
}

export function buildUser(): User {
  return {
    id: "u1",
    phone: "+989121234567",
    full_name: "متین رضایی",
    zone: zones[0],
    address: "ونک، خیابان ملاصدرا، پلاک ۱۲، واحد ۴",
    address_pin: { lat: 35.759, lng: 51.409 },
    default_delivery: "courier",
    referral_code: "MATIN42",
  };
}

export function buildReferral(): Referral {
  return { code: "MATIN42", invited_count: 4, total_referral_cashback: 86000 };
}

export function buildWallet(): Wallet {
  return { available: 124500, locked: 69000, currency: "IRT" };
}

export function buildTransactions(): WalletTransaction[] {
  return [
    {
      id: "t1",
      type: "topup",
      amount: 200000,
      balance_after: 193500,
      description: "شارژ کیف پول",
      created_at: daysAgo(5),
    },
    {
      id: "t2",
      type: "lock",
      amount: -69000,
      balance_after: 124500,
      description: "قفل وجه برای دیل مایع ظرفشویی",
      created_at: daysAgo(3),
    },
    {
      id: "t3",
      type: "cashback",
      amount: 12000,
      balance_after: 136500,
      description: "کش‌بک معرفی دوست",
      created_at: daysAgo(2),
    },
    {
      id: "t4",
      type: "delivery_reconciliation",
      amount: 8000,
      balance_after: 144500,
      description: "بازگشت بخشی از هزینه ارسال (مسیر مشترک)",
      created_at: hoursAgo(20),
    },
  ];
}

export function buildOrders(): Order[] {
  const deals = buildDeals();
  return [
    {
      id: "o1",
      deal: deals[2],
      quantity: 2,
      status: "locked",
      total_locked: 69000,
      delivery: { scheduled_date: daysFromNow(8), zone: "ونک", window: "۱۴:۰۰-۱۷:۰۰" },
    },
    {
      id: "o2",
      deal: deals[4],
      quantity: 1,
      status: "preparing",
      total_locked: 155000,
      delivery: { scheduled_date: daysFromNow(3), zone: "ونک", window: "۱۰:۰۰-۱۳:۰۰" },
    },
    {
      id: "o3",
      deal: deals[0],
      quantity: 3,
      status: "delivered",
      total_locked: 86000,
      delivery: { scheduled_date: daysAgo(6), zone: "ونک", window: "۱۷:۰۰-۲۰:۰۰" },
    },
  ];
}

export function buildDeliveries(): Delivery[] {
  return [
    {
      id: "dl1",
      scheduled_date: daysFromNow(8),
      zone: "ونک",
      window: "۱۴:۰۰-۱۷:۰۰",
      status: "scheduled",
      estimated_fee: 35000,
      final_fee: null,
      users_on_route: 4,
      items: [{ product_name: "مایع ظرفشویی ۴ لیتری", quantity: 2 }],
    },
    {
      id: "dl2",
      scheduled_date: daysAgo(6),
      zone: "ونک",
      window: "۱۷:۰۰-۲۰:۰۰",
      status: "reconciled",
      estimated_fee: 35000,
      final_fee: 27000,
      users_on_route: 6,
      items: [{ product_name: "آبجو مالت ساده", quantity: 3 }],
    },
  ];
}
