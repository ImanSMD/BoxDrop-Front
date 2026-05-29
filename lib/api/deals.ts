import { client } from "./client";
import type {
  CancelResult,
  Deal,
  DealDetail,
  DealSort,
  DealStatus,
  Paginated,
  Pledge,
} from "./types";

export type DealsListParams = {
  category?: string;
  status?: DealStatus;
  sort?: DealSort;
  page?: number;
};

export const dealsApi = {
  list: (params: DealsListParams = {}) =>
    client.get<Paginated<Deal>>("/deals", { params }),
  get: (id: string) => client.get<DealDetail>(`/deals/${id}`),
  join: (id: string, body: { quantity: number }) =>
    client.post<Pledge>(`/deals/${id}/join`, body),
};

export const pledgesApi = {
  update: (id: string, body: { quantity: number }) =>
    client.post<Pledge>(`/pledges/${id}/update`, body),
  cancel: (id: string) => client.post<CancelResult>(`/pledges/${id}/cancel`),
};
