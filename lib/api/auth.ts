import { client } from "./client";
import type { RequestOtpResult, VerifyOtpResult } from "./types";

export const authApi = {
  requestOtp: (phone: string) =>
    client.post<RequestOtpResult>("/auth/request-otp", { phone }, { skipAuth: true }),

  verifyOtp: (body: { phone: string; code: string; referral_code?: string }) =>
    client.post<VerifyOtpResult>("/auth/verify-otp", body, { skipAuth: true }),
};
