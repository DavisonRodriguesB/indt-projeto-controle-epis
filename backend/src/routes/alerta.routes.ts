import { Router } from "express";
import { handleListAlertas, handleListAlertasEventos, handleListAlertasMovimentacao } from "../controllers/alerta.controller";

const alertaRoutes = Router();

alertaRoutes.get("/", handleListAlertas);
alertaRoutes.get("/movimentacoes", handleListAlertasMovimentacao);
alertaRoutes.get("/eventos", handleListAlertasEventos);

export { alertaRoutes };
