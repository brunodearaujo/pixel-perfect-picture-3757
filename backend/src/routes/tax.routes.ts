import { Router } from "express";
import { calculate, tables } from "../controllers/tax.controller";

export const taxRouter = Router();
taxRouter.get("/tables", tables);
taxRouter.post("/calculate", calculate);
