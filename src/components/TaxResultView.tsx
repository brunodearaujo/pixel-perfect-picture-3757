import { CheckCircle2, RotateCcw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { brl } from "@/lib/money";
import type { TaxResult } from "@/services/taxApi";

const pct = (n: number) => `${n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

function Stat({ label, value, tone }: { label: string; value: string; tone?: "success" | "tax" }) {
  const color = tone === "success" ? "text-success" : tone === "tax" ? "text-tax" : "text-foreground";
  return (
    <div className="rounded-xl border bg-card p-4 shadow-card">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${color}`}>{value}</p>
    </div>
  );
}

export function TaxResultView({ r, onReset }: { r: TaxResult; onReset: () => void }) {
  const zero = r.finalTax === 0;
  const steps = [
    `Rendimentos tributáveis: ${brl(r.grossIncome)} de salário${r.otherIncome ? ` + ${brl(r.otherIncome)} de outros rendimentos` : ""} = ${brl(r.taxableIncome)}.`,
    `Deduções legais: INSS ${brl(r.socialSecurity)} + dependentes (${r.dependents} × R$ 189,59 = ${brl(r.dependentsDeduction)}) + pensão ${brl(r.alimony)} + outras ${brl(r.otherDeductions)} = ${brl(r.legalDeductions)}.`,
    `Comparação com o desconto simplificado (${brl(r.simplifiedDeduction)}): foi usada a opção ${r.deductionType === "legal" ? "das deduções legais" : "do desconto simplificado"}, mais vantajosa, de ${brl(r.deductionUsed)}.`,
    `Base de cálculo: ${brl(r.taxableIncome)} − ${brl(r.deductionUsed)} = ${brl(r.calculationBase)}.`,
    `Tabela progressiva: ${brl(r.calculationBase)} × ${pct(r.nominalRate)} − ${brl(r.bracketDeduction)} (parcela a deduzir) = ${brl(r.taxBeforeReduction)}.`,
    r.reductionRule === "full"
      ? `Redução da Lei nº 15.270/2025: rendimentos até R$ 5.000,00 têm o imposto reduzido integralmente (${brl(r.taxReduction)}).`
      : r.reductionRule === "partial"
        ? `Redução da Lei nº 15.270/2025: R$ 978,62 − (0,133145 × ${brl(r.taxableIncome)}) = ${brl(r.taxReduction)}.`
        : "Rendimentos acima de R$ 7.350,00 não têm redução adicional.",
    `Imposto devido: ${brl(r.taxBeforeReduction)} − ${brl(r.taxReduction)} = ${brl(r.finalTax)} (alíquota efetiva de ${pct(r.effectiveRate)}).`,
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className={`rounded-2xl border p-6 sm:p-8 ${zero ? "bg-success-soft" : "bg-tax-soft"}`}>
        <div className="flex items-center gap-2 text-sm font-medium">
          {zero ? <CheckCircle2 className="h-5 w-5 text-success" /> : <AlertCircle className="h-5 w-5 text-tax" />}
          {zero ? "Você não possui imposto de renda mensal a pagar nesta simulação." : "Este é o valor estimado do seu imposto de renda mensal."}
        </div>
        <p className={`mt-3 font-display text-5xl tabular-nums ${zero ? "text-success" : "text-tax"}`}>{brl(r.finalTax)}</p>
        <p className="mt-1 text-sm text-muted-foreground">Alíquota efetiva de {pct(r.effectiveRate)}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="Rendimentos tributáveis" value={brl(r.taxableIncome)} />
        <Stat label="Deduções legais" value={brl(r.legalDeductions)} />
        <Stat label="Desconto simplificado" value={brl(r.simplifiedDeduction)} />
        <Stat label="Dedução utilizada" value={brl(r.deductionUsed)} tone="success" />
        <Stat label="Base de cálculo" value={brl(r.calculationBase)} />
        <Stat label="Alíquota nominal" value={pct(r.nominalRate)} />
        <Stat label="Imposto antes da redução" value={brl(r.taxBeforeReduction)} tone="tax" />
        <Stat label="Redução 2026" value={brl(r.taxReduction)} tone="success" />
        <Stat label="IR mensal devido" value={brl(r.finalTax)} tone="tax" />
        <Stat label="Alíquota efetiva" value={pct(r.effectiveRate)} />
      </div>

      <div className="rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="mb-4 font-semibold">Demonstração do cálculo</h3>
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm leading-relaxed">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </div>

      <Button size="lg" variant="outline" onClick={onReset}><RotateCcw /> Nova simulação</Button>
    </div>
  );
}
