import { Router } from "express";
import {
    handleListUsers,
    handleLogin,
    handleMe,
    handleRefresh,
    handleRegisterUser,
    handleUpdateUser
} from "../controllers/auth.controller";
import { ensureAuthenticated, ensureRole } from "../middlewares/auth";

const authRoutes = Router();

authRoutes.post("/login", handleLogin);
authRoutes.post("/refresh", handleRefresh);
authRoutes.get("/me", ensureAuthenticated, handleMe);

authRoutes.get("/users", ensureAuthenticated, ensureRole(["admin"]), handleListUsers);
authRoutes.post("/users", ensureAuthenticated, ensureRole(["admin"]), handleRegisterUser);
authRoutes.put("/users/:id", ensureAuthenticated, ensureRole(["admin"]), handleUpdateUser);

export { authRoutes };