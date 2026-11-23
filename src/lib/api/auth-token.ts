/**
 * Admin Authentication & Token Helper for KiddieQuick
 * Handles Laravel Sanctum Bearer token storage and request headers.
 */

const ADMIN_TOKEN_KEY = "kiddiequick_admin_token";
const LEGACY_ADMIN_TOKEN_KEY = "majisavesh_admin_token";
const ADMIN_USER_KEY = "kiddiequick_admin_user";
const LEGACY_ADMIN_USER_KEY = "majisavesh_admin_user";

export type AdminUser = {
  id: string | number;
  name: string;
  email: string;
  role: string;
  phone?: string;
};

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(ADMIN_TOKEN_KEY) ||
    window.localStorage.getItem(LEGACY_ADMIN_TOKEN_KEY)
  );
}

export function setAdminToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_TOKEN_KEY, token);
  window.localStorage.setItem(LEGACY_ADMIN_TOKEN_KEY, token);
}

export function removeAdminToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_ADMIN_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_USER_KEY);
  window.localStorage.removeItem(LEGACY_ADMIN_USER_KEY);
}

export function getAdminUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(ADMIN_USER_KEY) ||
      window.localStorage.getItem(LEGACY_ADMIN_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminUser(user: AdminUser): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(user);
  window.localStorage.setItem(ADMIN_USER_KEY, json);
  window.localStorage.setItem(LEGACY_ADMIN_USER_KEY, json);
}

export function isAdminAuthenticated(): boolean {
  return Boolean(getAdminToken());
}

export function getAuthHeaders(includeContentType = true): HeadersInit {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    Accept: "application/json",
  };
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

