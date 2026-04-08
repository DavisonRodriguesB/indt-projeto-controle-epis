import { Router } from "express";
import {
  handleCreateMovimentacaoEntradaSaldo,
  handleCreateMovimentacaoEntrega
} from "../controllers/movimentacao.controller";
import { ensureRole } from "../middlewares/auth";

const movimentacaoRoutes = Router();

movimentacaoRoutes.post("/entrega", ensureRole(["admin", "almoxarife"]), handleCreateMovimentacaoEntrega);
movimentacaoRoutes.post("/entrada-saldo", ensureRole(["admin", "almoxarife"]), handleCreateMovimentacaoEntradaSaldo);

export { movimentacaoRoutes };
