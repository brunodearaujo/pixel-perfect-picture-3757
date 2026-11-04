# IR Fácil — Calculadora de IRRF mensal 2026

Simulador educacional do Imposto de Renda Retido na Fonte (ano-calendário 2026), com tabela progressiva, desconto simplificado e redução da Lei nº 15.270/2025.

## Arquitetura

- **Frontend:** React + TanStack Start + Tailwind CSS + shadcn/ui.
- **Servidor web/API da aplicação publicada:** TanStack Start com Nitro, executado em Node.js.
- **Regras tributárias:** `backend/src/services/taxCalculator.ts`, módulo compartilhado pelas rotas HTTP.
- **API Express independente:** código em `backend/`, mantido no projeto para execução e testes separados.
- **Container:** Docker multi-stage, compatível com execução sem root no OpenShift.

Na imagem de produção, o servidor TanStack Start entrega a interface e os endpoints HTTP `/api/*`. Esses endpoints utilizam o mesmo módulo de cálculo tributário. O Express permanece disponível como backend independente para testes locais, mas não é iniciado no container simplificado de deploy.

## Executar localmente

### Aplicação completa (frontend + rotas HTTP TanStack Start)

```bash
npm install
NITRO_PRESET=node-server npm run build
PORT=8080 HOST=0.0.0.0 npm start
```

Acesse `http://localhost:8080`.

### Modo desenvolvimento

```bash
npm install
npm run dev
```

O preview do Lovable usa as rotas de servidor do TanStack Start. Para a publicação em container, use o preset `node-server` conforme o Dockerfile.

### API Express independente (opcional)

```bash
cd backend
npm install
npm run dev
```

O Express usa a porta 8080 por padrão. Para rodá-lo simultaneamente com o frontend em desenvolvimento, configure portas diferentes e `VITE_API_URL` para apontar ao Express.

## Testes

```bash
# Testes do frontend e das regras tributárias compartilhadas
npm test

# Testes da API Express independente
cd backend
npm install
npm test
```

## Endpoints HTTP publicados

| Método | Rota | Descrição |
|---|---|---|
| GET | `/api/health` | Verifica se o servidor está funcionando |
| GET | `/api/tax/tables` | Retorna as tabelas, deduções e regras de redução de 2026 |
| POST | `/api/tax/calculate` | Calcula o IRRF mensal |

Exemplo de requisição:

```bash
curl -X POST http://localhost:8080/api/tax/calculate \
  -H 'Content-Type: application/json' \
  -d '{"grossIncome":6000,"socialSecurity":649.60,"dependents":0,"alimony":0,"otherDeductions":0}'
```

Resultado esperado para o exemplo: `finalTax` de R$ 382,88 e `taxReduction` de R$ 179,75.

## Docker

O Dockerfile compila o TanStack Start com Nitro no preset `node-server` e gera uma imagem que contém a interface e os endpoints HTTP.

```bash
docker build -t ir-facil:latest .
docker run --rm -p 8080:8080 ir-facil:latest
```

Acesse `http://localhost:8080` e teste a API em `http://localhost:8080/api/health`.

## OpenShift

A imagem:

- escuta em `0.0.0.0`;
- utiliza a porta `8080` por padrão, configurável por `PORT`;
- define `NITRO_HOST` e `NITRO_PORT` para o servidor Nitro;
- executa sem root e permite UID arbitrário com grupo 0;
- possui health check em `/api/health`;
- não depende de banco de dados nem de armazenamento persistente.

Depois de publicar a imagem em um registry acessível pelo cluster, crie a aplicação:

```bash
oc new-app --name=ir-facil --docker-image=<REGISTRY>/<USUARIO>/ir-facil:latest
oc expose service/ir-facil
oc get pods
oc get services
oc get routes
```

A URL pública será exibida em `oc get routes`.

## Observação acadêmica

A aplicação apresenta uma estimativa educacional do IRRF mensal. Não substitui a apuração oficial da Receita Federal nem uma declaração anual de IRPF.
