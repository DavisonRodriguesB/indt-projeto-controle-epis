import { Router } from "express";
import { handleConsultaEntregas } from "../controllers/consulta-entregas.controller";
import { ensureRole } from "../middlewares/auth";

const consultaEntregasRoutes = Router();

consultaEntregasRoutes.get("/entregas", ensureRole(["admin", "almoxarife"]), handleConsultaEntregas);

export { consultaEntregasRoutes };
