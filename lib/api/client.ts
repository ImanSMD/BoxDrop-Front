import { getAccessToken, setAccessToken } from "@/lib/auth/token-store";
import type { ApiErrorBody } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";
export const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS === "true";

export class ApiError extends Error {
  code: string;
  status: number;
  details?: Record<string, unknown>;

  constructor(
    code: string,
    message: string,
    status: number,
    details?: Record<string, unknown>,
  ) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

export type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined | null>;
  /** Skip attaching the Authorization header (e.g. for the OTP endpoints). */
  skipAuth?: boolean;
  signal?: AbortSignal;
};

type Method = "GET" | "POST" | "PATCH" | "DELETE";

function buildUrl(path: string, params?: RequestOptions["params"]): string {
  const url = new URL(BASE_URL + path);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

// Single-flight refresh so concurrent 401s trigger only one refresh call.
let refreshing: Promise<boolean> | null = null;

async function refreshAccessToken(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const res = await fetch("/api/auth/refresh", { method: "POST" });
        if (!res.ok) return false;
        const data = (await res.json()) as { access?: string };
        if (data.access) {
          setAccessToken(data.access);
          return true;
        }
        return false;
      } catch {
        return false;
      } finally {
        // Reset after the in-flight refresh settles.
        setTimeout(() => {
          refreshing = null;
        }, 0);
      }
    })();
  }
  return refreshing;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody | undefined;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    // non-JSON error body
  }
  const err = body?.error;
  return new ApiError(
    err?.code ?? "unknown",
    err?.message ?? "خطایی رخ داد. دوباره تلاش کنید.",
    res.status,
    err?.details,
  );
}

async function request<T>(
  method: Method,
  path: string,
  body?: unknown,
  options: RequestOptions = {},
  isRetry = false,
): Promise<T> {
  if (USE_MOCKS) {
    const { mockDispatch } = await import("./mocks");
    return mockDispatch<T>(method, path, body, options.params);
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (!options.skipAuth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(buildUrl(path, options.params), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal: options.signal,
  });

  if (res.status === 401 && !options.skipAuth && !isRetry) {
    const ok = await refreshAccessToken();
    if (ok) return request<T>(method, path, body, options, true);
  }

  if (!res.ok) throw await parseError(res);

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const client = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>("GET", path, undefined, options),
  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("POST", path, body, options),
  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>("PATCH", path, body, options),
  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>("DELETE", path, undefined, options),
};
