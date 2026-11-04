export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

/** Máscara: dígitos digitados → centavos → "R$ 1.234,56". */
export function maskMoney(raw: string): { display: string; value: number } {
  const digits = raw.replace(/\D/g, "").slice(0, 12);
  const value = Number(digits || "0") / 100;
  return { display: brl(value), value };
}
