import { describe, it, expect } from "vitest";
import request from "supertest";
import { createApp } from "./app";

const app = createApp();

describe("API REST", () => {
  it("GET /api/health", async () => {
    const r = await request(app).get("/api/health");
    expect(r.status).toBe(200);
    expect(r.body).toEqual({ status: "ok", message: "API IR Fácil funcionando" });
  });
  it("GET /api/tax/tables", async () => {
    const r = await request(app).get("/api/tax/tables");
    expect(r.body.data.year).toBe(2026);
  });
  it("POST /api/tax/calculate válido", async () => {
    const r = await request(app).post("/api/tax/calculate").send({ grossIncome: 6000, socialSecurity: 649.6 });
    expect(r.status).toBe(200);
    expect(r.body.data.finalTax).toBe(382.88);
  });
  it("POST /api/tax/calculate inválido → 400", async () => {
    const r = await request(app).post("/api/tax/calculate").send({ grossIncome: -1 });
    expect(r.status).toBe(400);
  });
});
