import { apiConfig } from "./config"
import { ApiRequestError, type ApiEnvelope } from "./types/common"

type RequestOptions = Omit<RequestInit, "body"> & { body?: unknown; next?: NextFetchRequestConfig; retries?: number }

async function fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try { return await fetch(input, { ...init, signal: controller.signal }) } finally { clearTimeout(timeout) }
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}, accessToken?: string): Promise<T> {
  const { body, retries = apiConfig.retries, headers, ...init } = options
  let lastError: unknown
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(`${apiConfig.baseUrl}${path}`, { ...init, headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body), next: options.next }, apiConfig.timeoutMs)
      const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null
      if (!response.ok || !payload?.success) { const error = payload?.error; throw new ApiRequestError(response.status, error?.code ?? "REQUEST_FAILED", error?.message ?? "The request could not be completed", error?.fieldErrors) }
      return payload.data
    } catch (error) { lastError = error; if (attempt < retries && (error instanceof TypeError || error instanceof ApiRequestError && error.status >= 500)) await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1))); else throw error }
  }
  throw lastError instanceof Error ? lastError : new Error("The request could not be completed")
}
