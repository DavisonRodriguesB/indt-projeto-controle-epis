import { Router } from "express";
import {
    handleCreateColaborador,
    handleDeleteColaborador,
    handleListColaboradores,
    handleUpdateColaborador,
    handleGetColaboradorById 
} from "../controllers/colaborador.controller";
import { ensureRole } from "../middlewares/auth";
import { handleGetEpisDoColaborador } from "../controllers/colaborador-epis.controller";

const colaboradorRoutes = Router();

colaboradorRoutes.get("/", handleListColaboradores);
colaboradorRoutes.get("/:id", handleGetColaboradorById);
colaboradorRoutes.get("/:id/epis", handleGetEpisDoColaborador);
colaboradorRoutes.post("/", ensureRole(["admin", "almoxarife"]), handleCreateColaborador);
colaboradorRoutes.put("/:id", ensureRole(["admin", "almoxarife"]), handleUpdateColaborador);
colaboradorRoutes.delete("/:id", ensureRole(["admin", "almoxarife"]), handleDeleteColaborador);

export { colaboradorRoutes };