import { client } from "./client";
import type { Category, Zone } from "./types";

export const catalogApi = {
  categories: () => client.get<Category[]>("/categories"),
  zones: () => client.get<Zone[]>("/zones"),
};
