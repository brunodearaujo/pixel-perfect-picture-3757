# IR Fácil — Calculadora de IRRF mensal 2026

Simulador educacional do Imposto de Renda Retido na Fonte (ano-calendário 2026), com tabela progressiva, desconto simplificado e redução da Lei nº 15.270/2025.

## Arquitetura

```text
backend/                 API Express + TypeScript (independente)
  src/services/taxCalculator.ts   lógica tributária pura (centavos inteiros)
  src/controllers/  src/routes/  src/config/  app.ts  server.ts
src/                     Frontend React (TanStack Start + Tailwind + shadcn/ui)
  services/taxApi.ts     cliente HTTP (fetch) — URL via VITE_API_URL
  routes/api/*           espelho dos endpoints para o preview do Lovable
Dockerfile               imagem multi-stage da API para OpenShift
```

O frontend nunca calcula o imposto: envia `POST /api/tax/calculate` e exibe a resposta.

**Limitação do Lovable:** o frontend do Lovable usa TanStack Start (não um SPA Vite puro), e o preview não executa Express. Por isso os mesmos endpoints existem como rotas de servidor que chamam o **mesmo** módulo `backend/src/services/taxCalculator.ts`. Fora do Lovable, rode o Express e aponte `VITE_API_URL` para ele.

## Executar localmente

```bash
# Backend
cd backend && npm install && npm run dev      # http://localhost:8080

# Frontend
bun install && VITE_API_URL=http://localhost:8080 bun run dev
```

## Testes

```bash
bunx vitest run src/test/tax-calculator.test.ts   # regras tributárias
cd backend && npm test                            # endpoints (supertest)
```

## Docker / OpenShift

```bash
docker build -t ir-facil .
docker run -p 8080:8080 -e CORS_ORIGIN=* ir-facil
```

Variáveis: `PORT` (8080), `CORS_ORIGIN` (`*` ou lista separada por vírgula), `STATIC_DIR`.
A imagem roda como usuário não-root (UID arbitrário + GID 0), escuta em `0.0.0.0` e não usa armazenamento.

```bash
oc new-app --name ir-facil --strategy=docker https://<seu-repo>.git
oc expose svc/ir-facil
# probes: GET /api/health
```

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| GET | /api/health | `{ "status": "ok", "message": "API IR Fácil funcionando" }` |
| GET | /api/tax/tables | Tabelas, deduções e regras de redução 2026 |
| POST | /api/tax/calculate | Calcula o IRRF (200, 400 para dados inválidos, 500) |

```bash
curl -X POST localhost:8080/api/tax/calculate -H 'Content-Type: application/json' \
  -d '{"grossIncome":6000,"socialSecurity":649.60,"dependents":0,"alimony":0,"otherDeductions":0}'
# → finalTax 382.88, taxReduction 179.75, effectiveRate 6.38
```
