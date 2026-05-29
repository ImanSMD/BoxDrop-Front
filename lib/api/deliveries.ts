import { client } from "./client";
import type { Delivery, DeliveryDetail } from "./types";

export const deliveriesApi = {
  list: () => client.get<Delivery[]>("/me/deliveries"),
  get: (id: string) => client.get<DeliveryDetail>(`/deliveries/${id}`),
};
