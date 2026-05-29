import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { walletApi } from "@/lib/api/wallet";
import { ApiError } from "@/lib/api/client";

export const useWallet = () =>
  useQuery({ queryKey: ["wallet"], queryFn: () => walletApi.get() });

export const useWalletTransactions = (page = 1) =>
  useQuery({
    queryKey: ["wallet-transactions", page],
    queryFn: () => walletApi.transactions(page),
  });

export const useTopup = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (amount: number) => walletApi.topup(amount),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در شارژ کیف پول.");
    },
  });
};
