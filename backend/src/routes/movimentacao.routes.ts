import { Router } from "express";
import {
  handleListMovimentacoesRecentes,
  handleCreateMovimentacaoEntradaSaldo,
  handleCreateMovimentacaoEntrega
} from "../controllers/movimentacao.controller";
import { ensureRole } from "../middlewares/auth";

const movimentacaoRoutes = Router();

movimentacaoRoutes.get("/recentes", handleListMovimentacoesRecentes);
movimentacaoRoutes.post("/entrega", ensureRole(["admin", "almoxarife"]), handleCreateMovimentacaoEntrega);
movimentacaoRoutes.post("/entrada-saldo", ensureRole(["admin", "almoxarife"]), handleCreateMovimentacaoEntradaSaldo);

export { movimentacaoRoutes };
