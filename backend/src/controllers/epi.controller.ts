import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { createEpi, deleteEpi, getEpiById, listEpis, updateEpi } from "../services/epi.service";
import { sendSuccess } from "../utiils/http-response";

const epiBodySchema = z.object({
  nome: z.string().min(2).max(120),
  ca: z.string().min(2).max(30),
  validade: z.string().date(),
  estoqueAtual: z.number().int().nonnegative(),
  estoqueMinimo: z.number().int().nonnegative()
});

const paramsSchema = z.object({
  id: z.coerce.number().int().positive()
});

export async function handleListEpis(_request: Request, response: Response): Promise<void> {
  const epis = await listEpis();
  sendSuccess(response, 200, epis, { total: epis.length });
}

export async function handleGetEpiById(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const epi = await getEpiById(id);

  if (!epi) {
    throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
  }

  sendSuccess(response, 200, epi);
}

export async function handleCreateEpi(request: Request, response: Response): Promise<void> {
  const payload = epiBodySchema.parse(request.body);
  const epi = await createEpi(payload);
  sendSuccess(response, 201, epi);
}

export async function handleUpdateEpi(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const payload = epiBodySchema.parse(request.body);
  const epi = await updateEpi(id, payload);

  if (!epi) {
    throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
  }

  sendSuccess(response, 200, epi);
}

export async function handleDeleteEpi(request: Request, response: Response): Promise<void> {
  const { id } = paramsSchema.parse(request.params);
  const deleted = await deleteEpi(id);

  if (!deleted) {
    throw new AppError(404, "EPI nao encontrado.", "EPI_NOT_FOUND");
  }

  sendSuccess(response, 200, { deleted: true });
}
