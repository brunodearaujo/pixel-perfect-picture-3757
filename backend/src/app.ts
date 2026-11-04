import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import path from "node:path";
import fs from "node:fs";
import { config } from "./config/env";
import { taxRouter } from "./routes/tax.routes";

export function createApp() {
  const app = express();
  app.use(express.json({ limit: "10kb" }));
  app.use(cors({ origin: config.corsOrigin === "*" ? true : config.corsOrigin.split(",") }));

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", message: "API IR Fácil funcionando" });
  });
  app.use("/api/tax", taxRouter);

  app.use("/api", (_req, res) => {
    res.status(404).json({ success: false, error: "Rota não encontrada" });
  });

  // Em produção, serve os arquivos estáticos do frontend (se existirem)
  if (fs.existsSync(config.staticDir)) {
    app.use(express.static(config.staticDir));
    app.get("*", (_req, res) => res.sendFile(path.join(config.staticDir, "index.html")));
  }

  // Middleware de erro padronizado (400 para JSON malformado, 500 para o resto)
  app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
    if (err.type === "entity.parse.failed") {
      return res.status(400).json({ success: false, error: "JSON inválido" });
    }
    console.error(err);
    res.status(500).json({ success: false, error: "Erro interno do servidor" });
  });

  return app;
}
