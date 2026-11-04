import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Landmark, Info, FileText, Scale, BadgePercent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TaxForm } from "@/components/TaxForm";
import { TaxResultView } from "@/components/TaxResultView";
import { calculateTaxRequest, type TaxInput, type TaxResult } from "@/services/taxApi";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "IR Fácil — Calculadora de Imposto de Renda 2026" },
      { name: "description", content: "Simule o IRRF mensal com as regras de 2026, incluindo a redução da Lei 15.270/2025." },
      { property: "og:title", content: "IR Fácil — Calculadora de Imposto de Renda 2026" },
      { property: "og:description", content: "Simule o IRRF mensal com as regras de 2026." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const how = [
  { icon: FileText, t: "Rendimentos", d: "Somamos salário e outros rendimentos tributáveis." },
  { icon: Scale, t: "Deduções", d: "Usamos o maior valor entre deduções legais e o simplificado de R$ 607,20." },
  { icon: BadgePercent, t: "Tabela e redução", d: "Aplicamos a tabela progressiva e a redução prevista para 2026." },
];

function Index() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TaxResult | null>(null);

  async function handle(input: TaxInput) {
    setLoading(true); setError(null);
    try {
      setResult(await calculateTaxRequest(input));
      setTimeout(() => document.getElementById("calc")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e) {
      setError((e as Error).message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen bg-hero">
      <header className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-6">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Landmark className="h-5 w-5" /></span>
        <span className="font-display text-xl text-primary">IR Fácil</span>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-20">
        <section className="py-12 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Ano-calendário 2026</p>
          <h1 className="mt-3 max-w-2xl font-display text-4xl leading-tight text-primary sm:text-6xl">Calculadora de Imposto de Renda</h1>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">Estime o seu IRRF mensal com base nas regras de 2026, incluindo a nova redução para quem ganha até R$ 7.350,00.</p>
          <Button size="lg" className="mt-8" onClick={() => document.getElementById("calc")?.scrollIntoView({ behavior: "smooth" })}>
            Calcular meu imposto <ArrowRight />
          </Button>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          {how.map(({ icon: I, t, d }) => (
            <div key={t} className="rounded-2xl border bg-card p-5 shadow-card">
              <I className="h-5 w-5 text-primary" />
              <h3 className="mt-3 font-semibold">{t}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </section>

        <section id="calc" className="scroll-mt-6 pt-16">
          <h2 className="mb-6 font-display text-3xl text-primary">{result ? "Resultado da simulação" : "Seus dados"}</h2>
          {error && <Alert variant="destructive" className="mb-6"><AlertDescription>{error}</AlertDescription></Alert>}
          {result ? <TaxResultView r={result} onReset={() => setResult(null)} /> : <TaxForm loading={loading} onSubmit={handle} />}
        </section>

        <Alert className="mt-12">
          <Info className="h-4 w-4" />
          <AlertDescription>Simulação educacional. Não substitui a apuração oficial da Receita Federal.</AlertDescription>
        </Alert>
      </main>
    </div>
  );
}
