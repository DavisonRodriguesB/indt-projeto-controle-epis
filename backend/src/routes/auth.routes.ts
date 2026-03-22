import { Router } from "express";
import { handleLogin, handleMe, handleRegisterUser } from "../controllers/auth.controller";
import { ensureAuthenticated, ensureRole } from "../middlewares/auth";

const authRoutes = Router();

authRoutes.post("/login", handleLogin);
authRoutes.get("/me", ensureAuthenticated, handleMe);
authRoutes.post("/users", ensureAuthenticated, ensureRole(["admin"]), handleRegisterUser);

export { authRoutes };
