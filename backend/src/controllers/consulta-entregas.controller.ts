import { Request, Response } from "express";
import { z } from "zod";
import { AppError } from "../middlewares/error-handler";
import { consultaEntregas } from "../services/consulta-entregas.service";
import { sendSuccess } from "../utiils/http-response";

const querySchema = z.object({
  colaborador_id: z.coerce.number().int().positive().optional(),
  matricula: z.string().min(1).optional(),
  epi_id: z.coerce.number().int().positive().optional(),
  ca: z.string().min(1).optional(),
  data_inicio: z.string().date().optional(),
  data_fim: z.string().date().optional(),
  mes: z.string().regex(/^\d{4}-\d{2}$/).optional(),
  usuario_id: z.coerce.number().int().positive().optional()
});

function diffDays(dataInicio: string, dataFim: string): number {
  const start = new Date(`${dataInicio}T00:00:00Z`).getTime();
  const end = new Date(`${dataFim}T00:00:00Z`).getTime();
  return Math.floor((end - start) / (1000 * 60 * 60 * 24));
}

export async function handleConsultaEntregas(request: Request, response: Response): Promise<void> {
  const query = querySchema.parse(request.query);

  if ((query.data_inicio && !query.data_fim) || (!query.data_inicio && query.data_fim)) {
    throw new AppError(400, "Informe data_inicio e data_fim juntos.", "INVALID_DATE_RANGE");
  }

  if (query.data_inicio && query.data_fim) {
    const days = diffDays(query.data_inicio, query.data_fim);
    if (days < 0 || days > 31) {
      throw new AppError(400, "Intervalo de datas deve ser de no maximo 31 dias.", "INVALID_DATE_RANGE");
    }
  }

  const rows = await consultaEntregas({
    colaboradorId: query.colaborador_id,
    matricula: query.matricula,
    epiId: query.epi_id,
    ca: query.ca,
    dataInicio: query.data_inicio,
    dataFim: query.data_fim,
    mes: query.mes,
    usuarioId: query.usuario_id
  });

  sendSuccess(response, 200, rows, { total: rows.length });
}
