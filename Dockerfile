# IR Fácil — TanStack Start + API HTTP, preparado para OpenShift
# O frontend e os endpoints /api/* são servidos pelo servidor Nitro/TanStack Start.

FROM node:22-alpine AS build
WORKDIR /app

# O projeto possui bun.lock, mas usamos npm para simplificar o build no container.
COPY package.json package-lock.json ./
RUN npm ci

# Inclui também backend/src/services/taxCalculator.ts, compartilhado pelas rotas HTTP.
COPY . .

# Gera um servidor Node.js (em vez do preset Cloudflare usado no preview).
ENV NITRO_PRESET=node-server
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080 \
    HOST=0.0.0.0 \
    NITRO_PORT=8080 \
    NITRO_HOST=0.0.0.0

# O bundle Nitro contém o servidor e os assets necessários para a aplicação.
COPY --from=build /app/.output ./.output

# OpenShift pode executar com UID arbitrário; GID 0 recebe as permissões necessárias.
RUN chgrp -R 0 /app && chmod -R g=u /app
USER 1001

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/api/health" >/dev/null || exit 1

CMD ["node", ".output/server/index.mjs"]
