import { Router } from "express";
import {
  handleCreateEpi,
  handleDeleteEpi,
  handleGetEpiById,
  handleListEpis,
  handleUpdateEpi
} from "../controllers/epi.controller";
import { ensureRole } from "../middlewares/auth";

const epiRoutes = Router();

epiRoutes.get("/", handleListEpis);
epiRoutes.get("/:id", handleGetEpiById);
epiRoutes.post("/", ensureRole(["admin"]), handleCreateEpi);
epiRoutes.put("/:id", ensureRole(["admin"]), handleUpdateEpi);
epiRoutes.delete("/:id", ensureRole(["admin"]), handleDeleteEpi);

export { epiRoutes };
