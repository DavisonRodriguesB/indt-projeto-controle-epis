import { Router } from "express";
import { handleLogin, handleMe, handleRefresh, handleRegisterUser } from "../controllers/auth.controller";
import { ensureAuthenticated, ensureRole } from "../middlewares/auth";

const authRoutes = Router();

authRoutes.post("/login", handleLogin);
authRoutes.post("/refresh", handleRefresh);
authRoutes.get("/me", ensureAuthenticated, handleMe);
authRoutes.post("/users", ensureAuthenticated, ensureRole(["admin"]), handleRegisterUser);

export { authRoutes };
