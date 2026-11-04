import type { TaxInput, TaxResult } from "../../backend/src/services/taxCalculator";

export type { TaxInput, TaxResult };

// URL da API configurável; vazio = mesma origem.
const API_URL = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "";

export async function calculateTaxRequest(input: TaxInput): Promise<TaxResult> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/tax/calculate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor. Tente novamente.");
  }
  const json = await res.json().catch(() => null);
  if (!res.ok || !json?.success) {
    throw new Error(json?.details?.join(" ") || json?.error || "Erro ao calcular o imposto.");
  }
  return json.data as TaxResult;
}
