import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";

export const useOrders = () =>
  useQuery({ queryKey: ["orders"], queryFn: () => ordersApi.list() });

export const useOrder = (id: string) =>
  useQuery({
    queryKey: ["order", id],
    queryFn: () => ordersApi.get(id),
    enabled: Boolean(id),
  });
