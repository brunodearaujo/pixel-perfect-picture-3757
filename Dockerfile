# IR Fácil — imagem da API Express (compatível com OpenShift: usuário não-root, GID 0)
FROM node:22-alpine AS build
WORKDIR /app
COPY backend/package*.json ./
RUN npm install
COPY backend/ ./
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./
# Arquivos estáticos do frontend (opcional) podem ser copiados para /app/public
RUN mkdir -p public && chgrp -R 0 /app && chmod -R g=u /app
USER 1001
EXPOSE 8080
HEALTHCHECK CMD wget -qO- http://127.0.0.1:${PORT}/api/health || exit 1
CMD ["node", "dist/server.js"]
