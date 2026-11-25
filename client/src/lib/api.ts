import { API_CONFIG } from "../config/api";

export const API = API_CONFIG.BASE_URL;
// Public (unauthenticated) routes are mounted beside /api on the server.
export const PUBLIC_API = API_CONFIG.BASE_URL.replace(/\/api\/?$/, "") + "/public";

export const errorMessage = (e: unknown, fallback = "Something went wrong") =>
  (e as any)?.response?.data?.message || fallback;

export const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ");

export const initials = (name?: string) =>
  (name ?? "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

export const pct = (n: number) => `${Math.round(n)}%`;

export const reportUrl = (slug?: string) => `${window.location.origin}/f/${slug ?? ""}`;
