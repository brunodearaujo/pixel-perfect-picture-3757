/**
 * IR Fácil — Núcleo de cálculo do IRRF mensal (ano-calendário 2026).
 *
 * Módulo PURO, sem dependência de Express ou de qualquer framework.
 * Todos os valores monetários são processados internamente em CENTAVOS
 * (inteiros) para evitar erros de ponto flutuante (ex.: 0,1 + 0,2).
 * Alíquotas são representadas em pontos-base (1% = 100 bp).
 */

export interface TaxInput {
  grossIncome: number;
  otherIncome?: number;
  socialSecurity?: number;
  dependents?: number;
  alimony?: number;
  otherDeductions?: number;
}

export interface TaxResult {
  grossIncome: number;
  otherIncome: number;
  taxableIncome: number;
  socialSecurity: number;
  dependents: number;
  dependentsDeduction: number;
  alimony: number;
  otherDeductions: number;
  legalDeductions: number;
  simplifiedDeduction: number;
  deductionUsed: number;
  deductionType: "legal" | "simplified";
  calculationBase: number;
  nominalRate: number;
  bracketDeduction: number;
  taxBeforeReduction: number;
  taxReduction: number;
  reductionRule: "full" | "partial" | "none";
  finalTax: number;
  effectiveRate: number;
}

/** Tabela progressiva mensal 2026 (limites superiores em centavos). */
export const BRACKETS = [
  { upTo: 242880, rateBp: 0, deduction: 0 },
  { upTo: 282665, rateBp: 750, deduction: 18216 },
  { upTo: 375105, rateBp: 1500, deduction: 39416 },
  { upTo: 466468, rateBp: 2250, deduction: 67549 },
  { upTo: Infinity, rateBp: 2750, deduction: 90873 },
] as const;

export const DEPENDENT_DEDUCTION = 18959; // R$ 189,59
export const SIMPLIFIED_DEDUCTION = 60720; // R$ 607,20

/** Redução da Lei nº 15.270/2025. */
export const REDUCTION = {
  fullUpTo: 500000, // R$ 5.000,00 → imposto zerado
  partialUpTo: 735000, // R$ 7.350,00
  constant: 97862, // R$ 978,62
  factor: 0.133145,
};

export class TaxValidationError extends Error {
  constructor(public details: string[]) {
    super("Dados inválidos");
  }
}

const toCents = (v: number) => Math.round(v * 100);
const toReais = (c: number) => c / 100;

/** Valida a entrada e devolve a lista de erros (vazia se válida). */
export function validateTaxInput(input: unknown): string[] {
  const errors: string[] = [];
  if (!input || typeof input !== "object") return ["O corpo da requisição deve ser um objeto JSON."];
  const i = input as Record<string, unknown>;
  const money: [string, string, boolean][] = [
    ["grossIncome", "Salário bruto", true],
    ["otherIncome", "Outros rendimentos", false],
    ["socialSecurity", "Contribuição previdenciária", false],
    ["alimony", "Pensão alimentícia", false],
    ["otherDeductions", "Outras deduções", false],
  ];
  for (const [key, label, required] of money) {
    const v = i[key];
    if (v === undefined || v === null) {
      if (required) errors.push(`${label} é obrigatório.`);
      continue;
    }
    if (typeof v !== "number" || !Number.isFinite(v)) errors.push(`${label} deve ser um número.`);
    else if (v < 0) errors.push(`${label} não pode ser negativo.`);
    else if (v > 1e9) errors.push(`${label} excede o valor máximo permitido.`);
  }
  const d = i.dependents;
  if (d !== undefined && d !== null && (typeof d !== "number" || !Number.isInteger(d) || d < 0 || d > 99)) {
    errors.push("Dependentes deve ser um número inteiro entre 0 e 99.");
  }
  return errors;
}

export function calculateTax(input: TaxInput): TaxResult {
  const errors = validateTaxInput(input);
  if (errors.length) throw new TaxValidationError(errors);

  // 1. Rendimentos tributáveis
  const gross = toCents(input.grossIncome);
  const other = toCents(input.otherIncome ?? 0);
  const taxable = gross + other;

  // 2. Deduções legais
  const inss = toCents(input.socialSecurity ?? 0);
  const dependents = input.dependents ?? 0;
  const depDeduction = dependents * DEPENDENT_DEDUCTION;
  const alimony = toCents(input.alimony ?? 0);
  const otherDed = toCents(input.otherDeductions ?? 0);
  const legal = inss + depDeduction + alimony + otherDed;

  // 3. Escolhe a opção mais vantajosa (não cumulativa).
  //    O simplificado nunca excede o próprio rendimento.
  const simplified = Math.min(SIMPLIFIED_DEDUCTION, taxable);
  const useLegal = legal >= simplified && legal > 0;
  const deductionUsed = useLegal ? legal : simplified;

  // 4. Base de cálculo nunca negativa
  const base = Math.max(0, taxable - deductionUsed);

  // 5. Imposto pela tabela progressiva: base × alíquota − parcela a deduzir
  const bracket = BRACKETS.find((b) => base <= b.upTo)!;
  const taxBefore = Math.max(0, Math.round((base * bracket.rateBp) / 10000) - bracket.deduction);

  // 6. Redução 2026 — faixa definida pelos RENDIMENTOS TRIBUTÁVEIS, não pela base
  let reduction = 0;
  let rule: TaxResult["reductionRule"] = "none";
  if (taxable <= REDUCTION.fullUpTo) {
    reduction = taxBefore;
    rule = "full";
  } else if (taxable <= REDUCTION.partialUpTo) {
    reduction = Math.max(0, REDUCTION.constant - Math.round(REDUCTION.factor * taxable));
    rule = "partial";
  }
  reduction = Math.min(reduction, taxBefore);
  const finalTax = Math.max(0, taxBefore - reduction);

  // 7. Alíquota efetiva (trata rendimento zero)
  const effectiveRate = taxable > 0 ? Math.round((finalTax / taxable) * 10000) / 100 : 0;

  return {
    grossIncome: toReais(gross),
    otherIncome: toReais(other),
    taxableIncome: toReais(taxable),
    socialSecurity: toReais(inss),
    dependents,
    dependentsDeduction: toReais(depDeduction),
    alimony: toReais(alimony),
    otherDeductions: toReais(otherDed),
    legalDeductions: toReais(legal),
    simplifiedDeduction: toReais(SIMPLIFIED_DEDUCTION),
    deductionUsed: toReais(deductionUsed),
    deductionType: useLegal ? "legal" : "simplified",
    calculationBase: toReais(base),
    nominalRate: bracket.rateBp / 100,
    bracketDeduction: toReais(bracket.deduction),
    taxBeforeReduction: toReais(taxBefore),
    taxReduction: toReais(reduction),
    reductionRule: rule,
    finalTax: toReais(finalTax),
    effectiveRate,
  };
}

export function getTaxTables() {
  return {
    year: 2026,
    brackets: BRACKETS.map((b, i) => ({
      from: i === 0 ? 0 : toReais(BRACKETS[i - 1].upTo) + 0.01,
      upTo: Number.isFinite(b.upTo) ? toReais(b.upTo) : null,
      rate: b.rateBp / 100,
      deduction: toReais(b.deduction),
    })),
    deductions: {
      perDependent: toReais(DEPENDENT_DEDUCTION),
      simplifiedMonthly: toReais(SIMPLIFIED_DEDUCTION),
    },
    reduction: {
      law: "Lei nº 15.270/2025",
      fullExemptionUpTo: toReais(REDUCTION.fullUpTo),
      partialUpTo: toReais(REDUCTION.partialUpTo),
      formula: "R$ 978,62 - (0,133145 × rendimentos tributáveis mensais)",
    },
  };
}
