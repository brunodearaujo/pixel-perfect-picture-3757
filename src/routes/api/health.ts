import { createFileRoute } from "@tanstack/react-router";

// Espelho do endpoint Express para o ambiente de preview do Lovable.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => Response.json({ status: "ok", message: "API IR Fácil funcionando" }),
    },
  },
});
