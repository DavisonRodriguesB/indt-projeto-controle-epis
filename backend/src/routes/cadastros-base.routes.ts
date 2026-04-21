import { Router } from "express";
import {
  handleCreateBaseItem,
  handleListAllBaseItems,
  handleListBaseItems,
  handleUpdateBaseItem
} from "../controllers/cadastros-base.controller";
import { ensureRole } from "../middlewares/auth";

const cadastrosBaseRoutes = Router();

cadastrosBaseRoutes.get("/cargos", (req, res, next) => {
  (req.params as { entity?: string }).entity = "cargos";
  return handleListBaseItems(req, res).catch(next);
});
cadastrosBaseRoutes.get("/cargos/todos", (req, res, next) => {
  (req.params as { entity?: string }).entity = "cargos";
  return handleListAllBaseItems(req, res).catch(next);
});
cadastrosBaseRoutes.post("/cargos", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  (req.params as { entity?: string }).entity = "cargos";
  return handleCreateBaseItem(req, res).catch(next);
});
cadastrosBaseRoutes.put("/cargos/:id", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  (req.params as { entity?: string }).entity = "cargos";
  return handleUpdateBaseItem(req, res).catch(next);
});


cadastrosBaseRoutes.get("/setores", (req, res, next) => {
  (req.params as { entity?: string }).entity = "setores";
  return handleListBaseItems(req, res).catch(next);
});
cadastrosBaseRoutes.get("/setores/todos", (req, res, next) => {
  (req.params as { entity?: string }).entity = "setores";
  return handleListAllBaseItems(req, res).catch(next);
});
cadastrosBaseRoutes.post("/setores", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  (req.params as { entity?: string }).entity = "setores";
  return handleCreateBaseItem(req, res).catch(next);
});
cadastrosBaseRoutes.put("/setores/:id", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  (req.params as { entity?: string }).entity = "setores";
  return handleUpdateBaseItem(req, res).catch(next);
});



cadastrosBaseRoutes.get("/categorias", (req, res, next) => {
  (req.params as { entity?: string }).entity = "categorias";
  return handleListBaseItems(req, res).catch(next);
});
cadastrosBaseRoutes.get("/categorias/todos", (req, res, next) => {
  (req.params as { entity?: string }).entity = "categorias";
  return handleListAllBaseItems(req, res).catch(next);
});
cadastrosBaseRoutes.post("/categorias", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  (req.params as { entity?: string }).entity = "categorias";
  return handleCreateBaseItem(req, res).catch(next);
});
cadastrosBaseRoutes.put("/categorias/:id", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  (req.params as { entity?: string }).entity = "categorias";
  return handleUpdateBaseItem(req, res).catch(next);
});

export { cadastrosBaseRoutes };
