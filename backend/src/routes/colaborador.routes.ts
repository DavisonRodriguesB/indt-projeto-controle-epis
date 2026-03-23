import { Router } from "express";
import { handleCreateColaborador, handleListColaboradores } from "../controllers/colaborador.controller";
import { ensureRole } from "../middlewares/auth";

const colaboradorRoutes = Router();

colaboradorRoutes.get("/", handleListColaboradores);
colaboradorRoutes.post("/", ensureRole(["admin", "almoxarife"]), handleCreateColaborador);

export { colaboradorRoutes };
