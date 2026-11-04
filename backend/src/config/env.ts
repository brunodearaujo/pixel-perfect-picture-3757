import path from "node:path";

export const config = {
  port: Number(process.env.PORT) || 8080,
  corsOrigin: process.env.CORS_ORIGIN || "*",
  staticDir: process.env.STATIC_DIR || path.resolve(process.cwd(), "public"),
};
