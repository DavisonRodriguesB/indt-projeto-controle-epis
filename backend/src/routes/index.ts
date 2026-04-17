import { Router } from "express";
import { cadastrosBaseRoutes } from "./cadastros-base.routes";
import { consultaEntregasRoutes } from "./consulta-entregas.routes";
import { authRoutes } from "./auth.routes";
import { colaboradorRoutes } from "./colaborador.routes";
import { entregaRoutes } from "./entrega.routes";
import { epiRoutes } from "./epi.routes";
import { alertaRoutes } from "./alerta.routes";
import { movimentacaoRoutes } from "./movimentacao.routes";
import { sendSuccess } from "../utiils/http-response";
import { ensureAuthenticated } from "../middlewares/auth";

const routes = Router();

routes.get("/health", (_request, response) => {
  sendSuccess(response, 200, { status: "ok" });
});

routes.use("/auth", authRoutes);

routes.use(ensureAuthenticated);
routes.use("/cadastro",cadastrosBaseRoutes);
routes.use("/epis", epiRoutes);
routes.use("/colaboradores", colaboradorRoutes);
routes.use("/entregas", entregaRoutes);
routes.use("/alertas", alertaRoutes);
routes.use("/movimentacoes", movimentacaoRoutes);
routes.use("/consultas", consultaEntregasRoutes);

export { routes };
