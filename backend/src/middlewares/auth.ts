import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AppError } from "./error-handler";
import { JwtPayload, UserRole } from "../types/auth";

export function ensureAuthenticated(request: Request, _response: Response, next: NextFunction): void {
  const authHeader = request.headers.authorization;

  if (!authHeader) {
    throw new AppError(401, "Token nao informado.", "AUTH_TOKEN_MISSING");
  }

  const [, token] = authHeader.split(" ");

  if (!token) {
    throw new AppError(401, "Token mal formatado.", "AUTH_TOKEN_INVALID");
  }

  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as JwtPayload;

    request.authUser = {
      id: Number(payload.sub),
      nome: payload.nome,
      email: payload.email,
      role: payload.role
    };

    next();
  } catch (_error) {
    throw new AppError(401, "Token invalido ou expirado.", "AUTH_TOKEN_INVALID");
  }
}

export function ensureRole(allowedRoles: UserRole[]) {
  return (request: Request, _response: Response, next: NextFunction): void => {
    const role = request.authUser?.role;

    if (!role) {
      throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
    }

    if (!allowedRoles.includes(role)) {
      throw new AppError(403, "Perfil sem permissao para esta operacao.", "AUTH_FORBIDDEN");
    }

    next();
  };
}
