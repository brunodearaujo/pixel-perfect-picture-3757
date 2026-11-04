import { createFileRoute } from "@tanstack/react-router";
import { calculateTax, validateTaxInput } from "../../../../backend/src/services/taxCalculator";

export const Route = createFileRoute("/api/tax/calculate")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ success: false, error: "JSON inválido" }, { status: 400 });
        }
        const errors = validateTaxInput(body);
        if (errors.length)
          return Response.json({ success: false, error: "Dados inválidos", details: errors }, { status: 400 });
        try {
          return Response.json({ success: true, data: calculateTax(body as never) });
        } catch {
          return Response.json({ success: false, error: "Erro interno do servidor" }, { status: 500 });
        }
      },
    },
  },
});
