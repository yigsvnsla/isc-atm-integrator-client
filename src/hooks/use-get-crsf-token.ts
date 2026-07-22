import { useEffect, useState } from "react";
import { Result } from "@/utils/result";
import { CrsfTokenResponse } from "@/types";

export function useCsrfToken() {
  const [result, setResult] = useState<Result<CrsfTokenResponse, Error> | null>(null);

  useEffect(() => {
    fetch("http://localhost:7000/api", { method: "GET", mode: "cors" })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(`HTTP ${res.status}: ${err.message ?? "Error en la petición"}`);
        }
        const data: CrsfTokenResponse = await res.json();
        return data;
      })
      .then((data) => setResult(Result.success(data)))
      .catch((err) => setResult(Result.failure(err instanceof Error ? err : new Error(String(err)))));
  }, []);

  return result;
}
