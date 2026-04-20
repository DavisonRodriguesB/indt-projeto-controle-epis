import { Router } from "express";
import { handleListAlertas, handleListAlertasMovimentacao } from "../controllers/alerta.controller";

const alertaRoutes = Router();

alertaRoutes.get("/", handleListAlertas);
alertaRoutes.get("/movimentacoes", handleListAlertasMovimentacao);

export { alertaRoutes };
