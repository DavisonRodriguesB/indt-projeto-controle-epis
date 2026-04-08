import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { sendSuccess } from "../utiils/http-response";
import {
  createColaborador,
  deleteColaborador,
  listColaboradores,
  updateColaborador
} from "../services/colaborador.service";

const bodySchema = z.object({
  nome: z.string().min(3).max(120),
  matricula: z.string().min(3).max(50),
  cargoId: z.number().int().positive().optional(),
  setorId: z.number().int().positive().optional(),
  setor: z.string().min(2).max(80).optional(),
  status: z.boolean().optional()
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export async function handleListColaboradores(_request: Request, response: Response): Promise<void> {
  const colaboradores = await listColaboradores();
  sendSuccess(response, 200, colaboradores, { total: colaboradores.length });
}

export async function handleCreateColaborador(request: Request, response: Response): Promise<void> {
  const payload = bodySchema.parse(request.body);
  const colaborador = await createColaborador(payload);
  sendSuccess(response, 201, colaborador);
}

export async function handleUpdateColaborador(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const payload = bodySchema.parse(request.body);
  const colaborador = await updateColaborador(id, payload);

  if (!colaborador) {
    throw new AppError(404, "Colaborador nao encontrado.", "COLABORADOR_NOT_FOUND");
  }

  sendSuccess(response, 200, colaborador);
}

export async function handleDeleteColaborador(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const deleted = await deleteColaborador(id);

  if (!deleted) {
    throw new AppError(404, "Colaborador nao encontrado.", "COLABORADOR_NOT_FOUND");
  }

  sendSuccess(response, 200, { deleted: true });
}
