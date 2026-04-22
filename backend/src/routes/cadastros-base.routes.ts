import { Router } from "express";
import {
  handleCreateBaseItem,
  handleListAllBaseItems,
  handleListBaseItems,
  handleUpdateBaseItem
} from "../controllers/cadastros-base.controller";
import { ensureRole } from "../middlewares/auth";

const cadastrosBaseRoutes = Router();

cadastrosBaseRoutes.get("/:entity/todos", (req, res, next) => {
  return handleListAllBaseItems(req, res).catch(next);
});

cadastrosBaseRoutes.get("/:entity", (req, res, next) => {
  return handleListBaseItems(req, res).catch(next);
});

cadastrosBaseRoutes.post("/:entity", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  return handleCreateBaseItem(req, res).catch(next);
});

cadastrosBaseRoutes.put("/:entity/:id", ensureRole(["admin", "almoxarife"]), (req, res, next) => {
  return handleUpdateBaseItem(req, res).catch(next);
});

export { cadastrosBaseRoutes };
