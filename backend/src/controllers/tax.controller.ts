import type { Request, Response } from "express";
import { calculateTax, getTaxTables, validateTaxInput } from "../services/taxCalculator";

export function tables(_req: Request, res: Response) {
  res.json({ success: true, data: getTaxTables() });
}

export function calculate(req: Request, res: Response) {
  const errors = validateTaxInput(req.body);
  if (errors.length) return res.status(400).json({ success: false, error: "Dados inválidos", details: errors });
  res.json({ success: true, data: calculateTax(req.body) });
}
