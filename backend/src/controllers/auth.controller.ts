import { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utiils/http-response";
import { listUsers, login, refreshSession, registerUser, updateUser } from "../services/auth.service";

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

const updateSchema = z.object({
  nome: z.string().min(2).max(120),
  email: z.string().email(),
  role: z.enum(["admin", "almoxarife"]),
  senha: z.string().min(6).max(100).optional()
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1)
});

export async function handleLogin(request: Request, response: Response): Promise<void> {
  const payload = loginSchema.parse(request.body);
  const result = await login(payload.email, payload.senha);
  sendSuccess(response, 200, result);
}

export async function handleListUsers(_request: Request, response: Response): Promise<void> {
  const users = await listUsers();
  sendSuccess(response, 200, users);
}

export async function handleRegisterUser(request: Request, response: Response): Promise<void> {
  const payload = registerSchema.parse(request.body);
  const user = await registerUser(payload);
  sendSuccess(response, 201, user);
}

export async function handleUpdateUser(request: Request, response: Response): Promise<void> {
  const id = z.coerce.number().int().positive().parse(request.params.id);
  const payload = updateSchema.parse(request.body);
  const user = await updateUser(id, payload);
  sendSuccess(response, 200, user);
}

export async function handleRefresh(request: Request, response: Response): Promise<void> {
  const payload = refreshSchema.parse(request.body);
  const result = await refreshSession(payload.refreshToken);
  sendSuccess(response, 200, result);
}

export async function handleMe(request: Request, response: Response): Promise<void> {
  sendSuccess(response, 200, request.authUser ?? null);
}