import { Request, Response } from "express";
import { z } from "zod";
import { sendSuccess } from "../utiils/http-response";
import { createEntrega, listEntregas } from "../services/entrega.service";
import { AppError } from "../middlewares/error-handler";

const entregaBodySchema = z.object({
  colaboradorId: z.number().int().positive(),
  epiId: z.number().int().positive(),
  quantidade: z.number().int().positive(),
  dataEntrega: z.string().date().optional(),
  observacao: z.string().max(500).optional()
});

export async function handleListEntregas(_request: Request, response: Response): Promise<void> {
  const entregas = await listEntregas();
  sendSuccess(response, 200, entregas, { total: entregas.length });
}

export async function handleCreateEntrega(request: Request, response: Response): Promise<void> {
  const payload = entregaBodySchema.parse(request.body);

  if (!request.authUser) {
    throw new AppError(401, "Usuario nao autenticado.", "AUTH_REQUIRED");
  }

  await createEntrega(payload, request.authUser.id);
  sendSuccess(response, 201, { created: true });
}
