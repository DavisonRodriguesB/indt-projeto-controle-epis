import { Router } from "express";
import { handleCreateEntrega, handleListEntregas } from "../controllers/entrega.controller";
import { ensureRole } from "../middlewares/auth";

const entregaRoutes = Router();

entregaRoutes.get("/", handleListEntregas);
entregaRoutes.post("/", ensureRole(["admin", "almoxarife"]), handleCreateEntrega);

export { entregaRoutes };
