import { client } from "./client";
import type { Paginated, TopupResult, Wallet, WalletTransaction } from "./types";

export const walletApi = {
  get: () => client.get<Wallet>("/wallet"),
  topup: (amount: number) => client.post<TopupResult>("/wallet/topup", { amount }),
  transactions: (page = 1) =>
    client.get<Paginated<WalletTransaction>>("/wallet/transactions", {
      params: { page },
    }),
};
