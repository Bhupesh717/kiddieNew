/**
 * Customer Authentication & Token Helper for KiddieQuick
 * Handles customer Bearer tokens, profile storage, and event broadcasting.
 */

export const CUSTOMER_TOKEN_KEY = "kiddiequick_customer_token";
export const LEGACY_CUSTOMER_TOKEN_KEY = "majisavesh_customer_token";
export const CUSTOMER_USER_KEY = "kiddiequick_customer_user";
export const LEGACY_CUSTOMER_USER_KEY = "majisavesh_customer_user";

export type CustomerUser = {
  id: string | number;
  name: string;
  email: string;
  phone?: string | null;
  role?: string;
  status?: string;
  totalOrders?: number;
  totalSpent?: number;
  createdAt?: string;
};

export function getCustomerToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    window.localStorage.getItem(CUSTOMER_TOKEN_KEY) ||
    window.localStorage.getItem(LEGACY_CUSTOMER_TOKEN_KEY)
  );
}

export function setCustomerToken(token: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CUSTOMER_TOKEN_KEY, token);
  window.localStorage.setItem(LEGACY_CUSTOMER_TOKEN_KEY, token);
  notifyCustomerAuthChanged();
}

export function removeCustomerToken(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(CUSTOMER_TOKEN_KEY);
  window.localStorage.removeItem(LEGACY_CUSTOMER_TOKEN_KEY);
  window.localStorage.removeItem(CUSTOMER_USER_KEY);
  window.localStorage.removeItem(LEGACY_CUSTOMER_USER_KEY);
  notifyCustomerAuthChanged();
}

export function getCustomerUser(): CustomerUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw =
      window.localStorage.getItem(CUSTOMER_USER_KEY) ||
      window.localStorage.getItem(LEGACY_CUSTOMER_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCustomerUser(user: CustomerUser, notify = false): void {
  if (typeof window === "undefined") return;
  const json = JSON.stringify(user);
  window.localStorage.setItem(CUSTOMER_USER_KEY, json);
  window.localStorage.setItem(LEGACY_CUSTOMER_USER_KEY, json);
  if (notify) {
    notifyCustomerAuthChanged();
  }
}

export function isCustomerAuthenticated(): boolean {
  return Boolean(getCustomerToken());
}

export function getCustomerAuthHeaders(includeContentType = true): HeadersInit {
  const token = getCustomerToken();
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

export function notifyCustomerAuthChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event("kiddiequick_customer_auth_changed"));
}

export async function customerLogout(): Promise<void> {
  const token = getCustomerToken();
  if (token) {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: getCustomerAuthHeaders(),
      });
    } catch {
      // Ignore network errors on logout
    }
  }
  removeCustomerToken();
}
