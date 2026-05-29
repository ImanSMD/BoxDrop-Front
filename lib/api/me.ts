import { client } from "./client";
import type { DeliveryMethod, GeoPin, Referral, User } from "./types";

export type UpdateMeBody = Partial<{
  full_name: string;
  address: string;
  address_pin: GeoPin | null;
  zone_id: string;
  default_delivery: DeliveryMethod;
}>;

export const meApi = {
  get: () => client.get<User>("/me"),
  update: (body: UpdateMeBody) => client.patch<User>("/me", body),
  referral: () => client.get<Referral>("/me/referral"),
};
