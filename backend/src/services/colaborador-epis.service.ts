import { AppDataSource } from "../database/data-source";

export interface EpiDoColaborador {
  movimentacao_item_id: number;
  movimentacao_id: number;
  epi_id: number;
  epi_nome: string;
  epi_ca: string;
  epi_codigo: string;
  quantidade: number;
  data_entrega: string;
  data_vencimento: string | null;
}

export async function getEpisDoColaborador(colaboradorId: number): Promise<EpiDoColaborador[]> {
  const rows = await AppDataSource.query(
    `
    SELECT DISTINCT ON (e.id)
      mi.id            AS movimentacao_item_id,
      m.id             AS movimentacao_id,
      e.id             AS epi_id,
      e.nome           AS epi_nome,
      e.ca             AS epi_ca,
      e.codigo         AS epi_codigo,
      mi.quantidade    AS quantidade,
      m.data_movimentacao AS data_entrega,
      mi.data_vencimento  AS data_vencimento
    FROM movimentacoes m
    INNER JOIN movimentacao_itens mi ON mi.movimentacao_id = m.id
    INNER JOIN epis e ON e.id = mi.epi_id
    WHERE m.tipo = 'entrega'
      AND m.colaborador_id = $1
    ORDER BY e.id, m.data_movimentacao DESC, m.id DESC
    `,
    [colaboradorId]
  );

  return rows;
}