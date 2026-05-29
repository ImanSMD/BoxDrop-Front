import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { dealsApi, pledgesApi, type DealsListParams } from "@/lib/api/deals";
import { ApiError } from "@/lib/api/client";

export const dealKeys = {
  list: (params: DealsListParams) => ["deals", params] as const,
  detail: (id: string) => ["deal", id] as const,
};

export const useDeals = (params: DealsListParams = {}) =>
  useQuery({
    queryKey: dealKeys.list(params),
    queryFn: () => dealsApi.list(params),
  });

export const useDeal = (id: string) =>
  useQuery({
    queryKey: dealKeys.detail(id),
    queryFn: () => dealsApi.get(id),
    enabled: Boolean(id),
  });

function invalidateAfterPledge(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["deals"] });
  qc.invalidateQueries({ queryKey: ["deal"] });
  qc.invalidateQueries({ queryKey: ["wallet"] });
  qc.invalidateQueries({ queryKey: ["orders"] });
}

export const useJoinDeal = (dealId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { quantity: number }) => dealsApi.join(dealId, body),
    onSuccess: () => {
      invalidateAfterPledge(qc);
      toast.success("به دیل پیوستی! وجه سفارش قفل شد.");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در پیوستن به دیل.");
    },
  });
};

export const usePledgeCancel = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pledgeId: string) => pledgesApi.cancel(pledgeId),
    onSuccess: () => {
      invalidateAfterPledge(qc);
      toast.success("سفارش لغو شد و وجه آزاد گردید.");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در لغو سفارش.");
    },
  });
};
