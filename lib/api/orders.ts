import { client } from "./client";
import type { Order, OrderDetail } from "./types";

export const ordersApi = {
  list: () => client.get<Order[]>("/orders"),
  get: (id: string) => client.get<OrderDetail>(`/orders/${id}`),
};
