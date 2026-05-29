import { useQuery } from "@tanstack/react-query";
import { deliveriesApi } from "@/lib/api/deliveries";

export const useDeliveries = () =>
  useQuery({ queryKey: ["deliveries"], queryFn: () => deliveriesApi.list() });

export const useDelivery = (id: string) =>
  useQuery({
    queryKey: ["delivery", id],
    queryFn: () => deliveriesApi.get(id),
    enabled: Boolean(id),
  });
