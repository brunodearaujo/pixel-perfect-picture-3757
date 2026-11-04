import { useState } from "react";
import { Calculator, Eraser, Loader2, Wallet, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { maskMoney, brl } from "@/lib/money";
import type { TaxInput } from "@/services/taxApi";

type MoneyKey = "grossIncome" | "otherIncome" | "socialSecurity" | "alimony" | "otherDeductions";
const empty = { grossIncome: 0, otherIncome: 0, socialSecurity: 0, alimony: 0, otherDeductions: 0 };

function MoneyField({ id, label, hint, value, onChange, error }: {
  id: string; label: string; hint?: string; value: number; onChange: (v: number) => void; error?: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} inputMode="numeric" value={brl(value)} aria-invalid={!!error}
        onChange={(e) => onChange(maskMoney(e.target.value).value)} className="h-11 text-base tabular-nums" />
      {error ? <p className="text-sm text-destructive">{error}</p> : hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function TaxForm({ loading, onSubmit }: { loading: boolean; onSubmit: (i: TaxInput) => void }) {
  const [v, setV] = useState(empty);
  const [deps, setDeps] = useState("0");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const set = (k: MoneyKey) => (n: number) => setV((p) => ({ ...p, [k]: n }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (v.grossIncome <= 0) errs.grossIncome = "Informe o salário bruto mensal.";
    if (!/^\d+$/.test(deps) || Number(deps) > 99) errs.dependents = "Use um número inteiro entre 0 e 99.";
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSubmit({ ...v, dependents: Number(deps) });
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section className="rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-semibold"><Wallet className="h-5 w-5 text-primary" /> Rendimentos</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField id="gross" label="Salário bruto mensal *" value={v.grossIncome} onChange={set("grossIncome")} error={errors["grossIncome"]} />
          <MoneyField id="other" label="Outros rendimentos tributáveis" hint="Opcional" value={v.otherIncome} onChange={set("otherIncome")} />
        </div>
      </section>
      <section className="rounded-2xl border bg-card p-6 shadow-card">
        <h3 className="mb-4 flex items-center gap-2 font-semibold"><Receipt className="h-5 w-5 text-primary" /> Deduções</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyField id="inss" label="Contribuição previdenciária (INSS)" value={v.socialSecurity} onChange={set("socialSecurity")} />
          <div className="space-y-1.5">
            <Label htmlFor="deps">Quantidade de dependentes</Label>
            <Input id="deps" inputMode="numeric" value={deps} aria-invalid={!!errors["dependents"]}
              onChange={(e) => setDeps(e.target.value.replace(/\D/g, "").slice(0, 2) || "0")} className="h-11 text-base" />
            {errors["dependents"] ? <p className="text-sm text-destructive">{errors["dependents"]}</p> : <p className="text-xs text-muted-foreground">R$ 189,59 por dependente</p>}
          </div>
          <MoneyField id="alimony" label="Pensão alimentícia dedutível" hint="Judicial ou por escritura pública" value={v.alimony} onChange={set("alimony")} />
          <MoneyField id="otherDed" label="Outras deduções legais" value={v.otherDeductions} onChange={set("otherDeductions")} />
        </div>
      </section>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={loading} className="sm:flex-1">
          {loading ? <Loader2 className="animate-spin" /> : <Calculator />} Calcular imposto
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={() => { setV(empty); setDeps("0"); setErrors({}); }}>
          <Eraser /> Limpar formulário
        </Button>
      </div>
    </form>
  );
}
