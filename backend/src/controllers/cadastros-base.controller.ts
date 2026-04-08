import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { sendSuccess } from "../utiils/http-response";
import { createBaseItem, listBaseItems, updateBaseItem } from "../services/cadastros-base.service";

const paramsEntitySchema = z.object({
  entity: z.enum(["cargos", "setores", "categorias"])
});

const paramsUpdateSchema = paramsEntitySchema.extend({
  id: z.coerce.number().int().positive()
});

const createBodySchema = z.object({
  descricao: z.string().min(3).max(120)
});

const updateBodySchema = z.object({
  descricao: z.string().min(3).max(120),
  ativo: z.boolean().optional()
});

export async function handleListBaseItems(request: Request, response: Response): Promise<void> {
  const { entity } = paramsEntitySchema.parse(request.params);
  const rows = await listBaseItems(entity);
  sendSuccess(response, 200, rows, { total: rows.length });
}

export async function handleCreateBaseItem(request: Request, response: Response): Promise<void> {
  const { entity } = paramsEntitySchema.parse(request.params);
  const payload = createBodySchema.parse(request.body);
  const row = await createBaseItem(entity, payload.descricao);
  sendSuccess(response, 201, row);
}

export async function handleUpdateBaseItem(request: Request, response: Response): Promise<void> {
  const { entity, id } = paramsUpdateSchema.parse(request.params);
  const payload = updateBodySchema.parse(request.body);
  const row = await updateBaseItem(entity, id, payload.descricao, payload.ativo);

  if (!row) {
    throw new AppError(404, "Registro nao encontrado.", "BASE_ITEM_NOT_FOUND");
  }

  sendSuccess(response, 200, row);
}
