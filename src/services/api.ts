import { readFileSync, writeFileSync, existsSync } from "fs"
import { join } from "path"

const TOKEN_PATH = join(process.cwd(), ".token")
const API_BASE = process.env.API_URL ?? "http://localhost:7000/api"

let _csrfToken = ""
let _sessionCookie = ""
let _unauthorizedHandlers: Array<() => void> = []

export function onUnauthorized(handler: () => void) {
  _unauthorizedHandlers.push(handler)
}

function triggerUnauthorized() {
  clearToken()
  _unauthorizedHandlers.forEach(h => h())
}

export function setCsrfToken(t: string) {
  _csrfToken = t
}

export function getCsrfToken(): string {
  return _csrfToken
}

export function setSessionCookie(cookie: string) {
  _sessionCookie = cookie
}

interface ApiOptions {
  method?: string
  body?: unknown
  params?: Record<string, string | number | undefined>
}

function getToken(): string | null {
  try {
    if (existsSync(TOKEN_PATH)) {
      return readFileSync(TOKEN_PATH, "utf-8").trim()
    }
  } catch {}
  return null
}

export function saveToken(token: string): void {
  writeFileSync(TOKEN_PATH, token, "utf-8")
}

export function clearToken(): void {
  try {
    writeFileSync(TOKEN_PATH, "", "utf-8")
  } catch {}
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-api-version": "1",
  }
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
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
    if (response.status === 401) triggerUnauthorized()
    throw new Error(err.message ?? `HTTP ${response.status}`)
  }

  console.debug(`API ${response.status} ${endpoint}`)
  return response.json() as Promise<T>
}
