import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { meApi, type UpdateMeBody } from "@/lib/api/me";
import { ApiError } from "@/lib/api/client";
import { useTokenStore } from "@/lib/auth/token-store";

export const useMe = () => {
  const accessToken = useTokenStore((s) => s.accessToken);
  return useQuery({
    queryKey: ["me"],
    queryFn: () => meApi.get(),
    enabled: Boolean(accessToken),
  });
};

export const useReferral = () =>
  useQuery({ queryKey: ["referral"], queryFn: () => meApi.referral() });

export const useUpdateMe = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateMeBody) => meApi.update(body),
    onSuccess: (user) => {
      qc.setQueryData(["me"], user);
      toast.success("اطلاعات ذخیره شد.");
    },
    onError: (err) => {
      toast.error(err instanceof ApiError ? err.message : "خطا در ذخیره اطلاعات.");
    },
  });
};
