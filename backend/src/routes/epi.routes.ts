import { Router } from "express";
import {
  handleCreateEpi,
  handleEntradaSaldoEpi,
  handleGetEpiById,
  handleListEpis,
  handleUpdateEpi
} from "../controllers/epi.controller";
import { handleCreateMovimentacaoEntradaSaldo } from "../controllers/movimentacao.controller";
import { ensureRole } from "../middlewares/auth";

const epiRoutes = Router();

epiRoutes.get("/", handleListEpis);
epiRoutes.get("/:id", handleGetEpiById);
epiRoutes.post("/", ensureRole(["admin"]), handleCreateEpi);
epiRoutes.post("/entrada-saldo", ensureRole(["admin", "almoxarife"]), handleCreateMovimentacaoEntradaSaldo);
epiRoutes.put("/:id", ensureRole(["admin"]), handleUpdateEpi);
epiRoutes.post("/:id/entrada-saldo", ensureRole(["admin", "almoxarife"]), handleEntradaSaldoEpi);

export { epiRoutes };
