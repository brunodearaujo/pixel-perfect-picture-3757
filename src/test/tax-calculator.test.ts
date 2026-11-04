import { describe, it, expect } from "vitest";
import { calculateTax, validateTaxInput } from "../../backend/src/services/taxCalculator";

describe("IRRF 2026", () => {
  it("R$ 3.000 → isento pela redução", () => {
    const r = calculateTax({ grossIncome: 3000 });
    expect(r.deductionType).toBe("simplified");
    expect(r.calculationBase).toBe(2392.8);
    expect(r.finalTax).toBe(0);
  });
  it("R$ 4.000 → imposto apurado zerado pela redução", () => {
    const r = calculateTax({ grossIncome: 4000 });
    expect(r.taxBeforeReduction).toBe(114.76); // 3392,80×15% − 394,16
    expect(r.finalTax).toBe(0);
  });
  it("R$ 5.000 → imposto zero", () => {
    const r = calculateTax({ grossIncome: 5000 });
    expect(r.taxBeforeReduction).toBe(312.89);
    expect(r.finalTax).toBe(0);
  });
  it("R$ 6.000 com INSS 649,60 (exemplo do enunciado)", () => {
    const r = calculateTax({ grossIncome: 6000, socialSecurity: 649.6 });
    expect(r.deductionType).toBe("legal");
    expect(r.calculationBase).toBe(5350.4);
    expect(r.taxBeforeReduction).toBe(562.63);
    expect(r.taxReduction).toBe(179.75);
    expect(r.finalTax).toBe(382.88);
    expect(r.effectiveRate).toBe(6.38);
  });
  it("R$ 7.350 → redução residual", () => {
    const r = calculateTax({ grossIncome: 7350 });
    expect(r.taxReduction).toBe(0);
    expect(r.finalTax).toBe(945.54);
  });
  it("R$ 10.000 → sem redução", () => {
    const r = calculateTax({ grossIncome: 10000 });
    expect(r.taxReduction).toBe(0);
    expect(r.finalTax).toBe(1674.29); // 9392,80×27,5% − 908,73
  });
  it("INSS maior que o simplificado usa deduções legais", () => {
    const r = calculateTax({ grossIncome: 8000, socialSecurity: 800 });
    expect(r.deductionUsed).toBe(800);
  });
  it("dependentes somam R$ 189,59 cada", () => {
    const r = calculateTax({ grossIncome: 8000, socialSecurity: 500, dependents: 2 });
    expect(r.legalDeductions).toBe(879.18);
    expect(r.deductionType).toBe("legal");
  });
  it("valores negativos/inválidos são rejeitados", () => {
    expect(validateTaxInput({ grossIncome: -10 }).length).toBe(1);
    expect(validateTaxInput({ grossIncome: 1000, dependents: 1.5 }).length).toBe(1);
    expect(() => calculateTax({ grossIncome: -1 })).toThrow();
  });
  it("rendimento zero → tudo zero", () => {
    const r = calculateTax({ grossIncome: 0 });
    expect(r.finalTax).toBe(0);
    expect(r.effectiveRate).toBe(0);
  });
});
