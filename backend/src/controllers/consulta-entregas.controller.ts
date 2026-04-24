import { Request, Response } from "express";
import { z } from "zod";
import { consultaEntregas } from "../services/consulta-entregas.service";
import { sendSuccess } from "../utiils/http-response";

const querySchema = z.object({
  colaborador_id: z.coerce.number().optional(),
  matricula: z.string().optional(),
  ca: z.string().optional(),
  protocolo: z.string().optional(),
  data_inicio: z.string().optional(),
  data_fim: z.string().optional(),
  usuario_id: z.coerce.number().optional()
});

export async function handleConsultaEntregas(request: Request, response: Response): Promise<void> {
  const query = querySchema.parse(request.query);

  const rows = await consultaEntregas({
    colaboradorId: query.colaborador_id,
    matricula: query.matricula,
    ca: query.ca,
    protocolo: query.protocolo,
    dataInicio: query.data_inicio,
    dataFim: query.data_fim,
    usuarioId: query.usuario_id
  });

  sendSuccess(response, 200, rows, { total: rows.length });
}