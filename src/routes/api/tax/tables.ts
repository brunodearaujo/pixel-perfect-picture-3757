import { createFileRoute } from "@tanstack/react-router";
import { getTaxTables } from "../../../../backend/src/services/taxCalculator";

export const Route = createFileRoute("/api/tax/tables")({
  server: {
    handlers: {
      GET: async () => Response.json({ success: true, data: getTaxTables() }),
    },
  },
});
