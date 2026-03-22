import { Router } from "express";
import { authRoutes } from "./auth.routes";
import { colaboradorRoutes } from "./colaborador.routes";
import { entregaRoutes } from "./entrega.routes";
import { epiRoutes } from "./epi.routes";
import { alertaRoutes } from "./alerta.routes";
import { sendSuccess } from "../utiils/http-response";
import { ensureAuthenticated } from "../middlewares/auth";

const routes = Router();

routes.get("/health", (_request, response) => {
  sendSuccess(response, 200, { status: "ok" });
});

routes.use("/auth", authRoutes);

routes.use(ensureAuthenticated);
routes.use("/epis", epiRoutes);
routes.use("/colaboradores", colaboradorRoutes);
routes.use("/entregas", entregaRoutes);
routes.use("/alertas", alertaRoutes);

export { routes };
