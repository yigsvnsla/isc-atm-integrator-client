import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const TOKEN_PATH = join(process.cwd(), ".token")
const API_BASE = process.env.API_URL ?? "http://localhost:7000/api"

let _accessToken = ""
let _csrfToken = ""
let _refreshToken = ""
let _sessionCookie = ""
let _authChangeHandler: (() => void) | null = null

export function onAuthChange(h: () => void) {
  _authChangeHandler = h
}

interface AuthTokens {
  accessToken?: string
  refreshToken?: string
  csrfToken?: string
  sessionCookie?: string
}

export function setAuthTokens(tokens: AuthTokens) {
  if (tokens.accessToken !== undefined) _accessToken = tokens.accessToken
  if (tokens.refreshToken !== undefined) _refreshToken = tokens.refreshToken
  if (tokens.csrfToken !== undefined) _csrfToken = tokens.csrfToken
  if (tokens.sessionCookie !== undefined) _sessionCookie = tokens.sessionCookie
}

export function clearAuth() {
  _accessToken = ""
  _csrfToken = ""
  _refreshToken = ""
  _sessionCookie = ""
  try { writeFileSync(TOKEN_PATH, "", "utf-8") } catch {}
}

interface ApiOptions {
  method?: string
  body?: unknown
  params?: Record<string, string | number | undefined>
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-version": "1",
  }
  if (_accessToken) {
    headers["Authorization"] = `Bearer ${_accessToken}`
  }

  const method = options.method ?? "GET"
  if (_csrfToken && method !== "GET") {
    headers["x-csrf-token"] = _csrfToken
  }
  if (_sessionCookie) {
    headers["Cookie"] = _sessionCookie
  }

  const url = new URL(`${API_BASE}/${endpoint}`)
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const response = await fetch(url.toString(), {
    method,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  })

  console.debug(`API ${method} ${endpoint}`, { params: options.params })

  const setCookie = response.headers.get("set-cookie")
  if (setCookie) _sessionCookie = setCookie.split(";")[0]

  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: response.statusText }))
    console.error(`API ${response.status} ${endpoint}`, err)
    if (response.status === 401) {
      clearAuth()
      _authChangeHandler?.()
    }
    throw new Error(err.message ?? `HTTP ${response.status}`)
  }

  console.debug(`API ${response.status} ${endpoint}`)
  return response.json() as Promise<T>
}
