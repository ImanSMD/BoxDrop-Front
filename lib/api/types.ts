// Typed shapes for the BoxDrop API contract (CLAUDE.md §8).
// Money fields are integer Toman. Datetimes are ISO 8601 UTC strings.

export type Paginated<T> = {
  results: T[];
  count: number;
  next: string | null;
  previous: string | null;
};

export type ApiErrorBody = {
  error: {
    code: string;
    message: string; // Persian, user-facing
    details?: Record<string, unknown>;
  };
};

// ---- Catalog ---------------------------------------------------------------

export type Category = {
  id: string;
  name: string;
  emoji: string;
};

export type Zone = {
  id: string;
  name: string;
};

export type TierLevel = "bronze" | "silver" | "gold";

export type DealStatus =
  | "open"
  | "locked"
  | "extended"
  | "fulfilled"
  | "expired"
  | "canceled";

export type DealSort = "ending_soon" | "popular" | "savings";

export type Product = {
  name: string;
  emoji: string;
  image_url: string | null;
  category: Category;
};

export type MyPledgeSummary = {
  quantity: number;
};

export type Deal = {
  id: string;
  product: Product;
  box_size: number;
  units_pledged: number;
  wholesale_price: number;
  retail_reference: number;
  savings_percent: number;
  status: DealStatus;
  opens_at: string;
  lock_deadline: string;
  extended_deadline: string | null;
  participant_count: number;
  participant_avatars: string[];
  // null until the deal reaches the bronze threshold (backend current_tier()).
  tier: TierLevel | null;
  zone?: Zone;
  my_pledge: MyPledgeSummary | null;
};

export type DealTier = {
  level: TierLevel;
  threshold: number;
  label: string;
};

export type DealRewards = {
  volume_champion_pct: number;
  referral_pct: number;
};

export type Supplier = {
  business_name: string;
};

export type DealDetail = Deal & {
  description: string;
  tiers: DealTier[];
  rewards: DealRewards;
  estimated_delivery_fee: number;
  supplier: Supplier;
};

// ---- User ------------------------------------------------------------------

export type DeliveryMethod = "courier" | "pickup";

export type GeoPin = { lat: number; lng: number };

export type User = {
  id: string;
  phone: string;
  full_name: string;
  zone: Zone | null;
  address: string;
  address_pin: GeoPin | null;
  default_delivery: DeliveryMethod;
  referral_code: string;
};

export type Referral = {
  code: string;
  invited_count: number;
  total_referral_cashback: number;
};

// ---- Wallet ----------------------------------------------------------------

export type Wallet = {
  available: number;
  locked: number;
  currency: "IRT";
};

export type WalletTransactionType =
  | "topup"
  | "lock"
  | "unlock"
  | "capture"
  | "refund"
  | "cashback"
  | "delivery_reconciliation";

export type WalletTransaction = {
  id: string;
  type: WalletTransactionType;
  amount: number;
  balance_after: number;
  description: string;
  created_at: string;
};

export type TopupResult = {
  redirect_url: string;
  payment_id: string;
};

// ---- Pledges ---------------------------------------------------------------

export type PledgeStatus = "active" | "locked" | "canceled" | "refunded";

export type Pledge = {
  id: string;
  deal_id: string;
  quantity: number;
  unit_price: number;
  goods_total: number;
  estimated_delivery_fee: number;
  total_locked: number;
  status: PledgeStatus;
  is_volume_champion: boolean;
  grace_until: string;
  created_at: string;
};

export type CancelResult = {
  ok: boolean;
  refunded: number;
};

// ---- Orders ----------------------------------------------------------------

export type OrderStatus =
  | "joined"
  | "locked"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "canceled";

export type OrderDeliverySummary = {
  scheduled_date: string;
  zone: string;
  window: string;
};

export type TimelineStep = {
  state: OrderStatus;
  at: string | null;
  done: boolean;
};

export type Order = {
  id: string;
  deal: Deal;
  quantity: number;
  status: OrderStatus;
  total_locked: number;
  delivery: OrderDeliverySummary | null;
};

export type OrderDetail = Order & {
  timeline: TimelineStep[];
};

// ---- Deliveries ------------------------------------------------------------

export type DeliveryStatus =
  | "pending"
  | "scheduled"
  | "out_for_delivery"
  | "delivered"
  | "reconciled";

export type DeliveryItem = {
  product_name: string;
  quantity: number;
};

export type Delivery = {
  id: string;
  scheduled_date: string;
  zone: string;
  window: string;
  status: DeliveryStatus;
  estimated_fee: number;
  final_fee: number | null;
  users_on_route: number | null;
  items: DeliveryItem[];
};

export type DeliveryDetail = Delivery;

// ---- Auth ------------------------------------------------------------------

export type RequestOtpResult = {
  sent: boolean;
  expires_in: number;
};

export type VerifyOtpResult = {
  access: string;
  refresh: string;
  user: User;
  is_new: boolean;
};

export type RefreshResult = {
  access: string;
};
