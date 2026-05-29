import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/catalog";

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: () => catalogApi.categories(),
    staleTime: 5 * 60_000,
  });

export const useZones = () =>
  useQuery({
    queryKey: ["zones"],
    queryFn: () => catalogApi.zones(),
    staleTime: 5 * 60_000,
  });
