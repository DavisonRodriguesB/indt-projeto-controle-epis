import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { sendSuccess } from "../utiils/http-response";
import { createBaseItem, listBaseItemsPaginated, updateBaseItem } from "../services/cadastros-base.service";

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

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  status: z.preprocess(
    (value) => {
      if (value === "true" || value === true) {
        return true;
      }
      if (value === "false" || value === false) {
        return false;
      }
      return undefined;
    },
    z.boolean().optional()
  )
});

const listAllQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20)
});

export async function handleListBaseItems(request: Request, response: Response): Promise<void> {
  const { entity } = paramsEntitySchema.parse(request.params);
  const { page, pageSize, status } = listQuerySchema.parse(request.query ?? {});
  const result = await listBaseItemsPaginated(entity, { page, pageSize, status });

  sendSuccess(response, 200, result.data, {
    total: result.total,
    page,
    pageSize,
    status: typeof status === "boolean" ? status : "all"
  });
}

export async function handleListAllBaseItems(request: Request, response: Response): Promise<void> {
  const { entity } = paramsEntitySchema.parse(request.params);
  const { page, pageSize } = listAllQuerySchema.parse(request.query ?? {});
  const result = await listBaseItemsPaginated(entity, { page, pageSize });

  sendSuccess(response, 200, result.data, {
    total: result.total,
    page,
    pageSize,
    status: "todos"
  });
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
