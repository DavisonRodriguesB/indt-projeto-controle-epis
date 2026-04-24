import { Router } from "express";
import {
    handleCreateColaborador,
    handleDeleteColaborador,
    handleListColaboradores,
    handleUpdateColaborador,
    handleGetColaboradorById 
} from "../controllers/colaborador.controller";
import { ensureRole } from "../middlewares/auth";

const colaboradorRoutes = Router();

colaboradorRoutes.get("/", handleListColaboradores);
colaboradorRoutes.get("/:id", handleGetColaboradorById);
colaboradorRoutes.post("/", ensureRole(["admin", "almoxarife"]), handleCreateColaborador);
colaboradorRoutes.put("/:id", ensureRole(["admin", "almoxarife"]), handleUpdateColaborador);
colaboradorRoutes.delete("/:id", ensureRole(["admin", "almoxarife"]), handleDeleteColaborador);

export { colaboradorRoutes };