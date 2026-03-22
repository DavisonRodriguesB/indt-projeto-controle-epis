import { Router } from "express";
import { handleListAlertas } from "../controllers/alerta.controller";

const alertaRoutes = Router();

alertaRoutes.get("/", handleListAlertas);

export { alertaRoutes };
