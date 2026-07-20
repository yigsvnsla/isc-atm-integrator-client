import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const TOKEN_PATH = join(process.cwd(), ".token");
const API_BASE = process.env.API_URL ?? "http://localhost:3000/api/v1";

interface ApiOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | number | undefined>;
}

function getToken(): string | null {
  try {
    if (existsSync(TOKEN_PATH)) {
      return readFileSync(TOKEN_PATH, "utf-8").trim();
    }
  } catch {}
  return null;
}

export function saveToken(token: string): void {
  writeFileSync(TOKEN_PATH, token, "utf-8");
}

export function clearToken(): void {
  try {
    writeFileSync(TOKEN_PATH, "", "utf-8");
  } catch {}
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const url = new URL(`${API_BASE}/${endpoint}`);
  if (options.params) {
    for (const [key, value] of Object.entries(options.params)) {
      if (value !== undefined) url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    method: options.method ?? "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  console.debug(`API ${options.method ?? "GET"} ${endpoint}`, {
    params: options.params,
  });

  if (!response.ok) {
    const err = await response
      .json()
      .catch(() => ({ message: response.statusText }));
    console.error(`API ${response.status} ${endpoint}`, err);
    throw new Error(err.message ?? `HTTP ${response.status}`);
  }

  console.debug(`API ${response.status} ${endpoint}`);

  return response.json() as Promise<T>;
}
