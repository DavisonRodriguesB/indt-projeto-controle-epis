import { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utiils/http-response";
import { login, refreshSession, registerUser } from "../services/auth.service";

const loginSchema = z.object({
  email: z.string().email(),
  senha: z.string().min(6)
});

const registerSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email(),
  senha: z.string().min(6).max(100),
  role: z.enum(["admin", "almoxarife"])
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export async function handleLogin(request: Request, response: Response): Promise<void> {
  const payload = loginSchema.parse(request.body);
  const result = await login(payload.email, payload.senha);
  sendSuccess(response, 200, result);
}

export async function handleRegisterUser(request: Request, response: Response): Promise<void> {
  const payload = registerSchema.parse(request.body);
  const user = await registerUser(payload);
  sendSuccess(response, 201, user);
}

export async function handleRefresh(request: Request, response: Response): Promise<void> {
  const payload = refreshSchema.parse(request.body);
  const result = await refreshSession(payload.refreshToken);
  sendSuccess(response, 200, result);
}

export async function handleMe(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, request.authUser ?? null);
}
