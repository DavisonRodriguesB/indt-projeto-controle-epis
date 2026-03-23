import { AppDataSource } from "../database/data-source";

interface AlertaValidade {
  id: number;
  nome: string;
  ca: string;
  validade: string;
  diasParaVencer: number;
  status: "vencido" | "vence_em_breve";
}

interface AlertaEstoque {
  id: number;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  faltaParaMinimo: number;
}

interface AlertasResult {
  validade: AlertaValidade[];
  estoqueMinimo: AlertaEstoque[];
}

export async function listAlertas(diasValidade = 30): Promise<AlertasResult> {
  const validadeRows = await AppDataSource.query(
    `
      SELECT
        id,
        nome,
        ca,
        validade,
        (validade - CURRENT_DATE) AS dias_para_vencer
      FROM epis
      WHERE validade <= CURRENT_DATE + $1::int
      ORDER BY validade ASC
    `,
    [diasValidade]
  );

  const estoqueRows = await AppDataSource.query(
    `
      SELECT id, nome, estoque_atual, estoque_minimo
      FROM epis
      WHERE estoque_atual <= estoque_minimo
      ORDER BY (estoque_minimo - estoque_atual) DESC, nome ASC
    `
  );

  return {
    validade: validadeRows.map((row: Record<string, unknown>) => {
      const dias = Number(row.dias_para_vencer);

      return {
        id: Number(row.id),
        nome: String(row.nome),
        ca: String(row.ca),
        validade: String(row.validade),
        diasParaVencer: dias,
        status: dias < 0 ? "vencido" : "vence_em_breve"
      };
    }),
    estoqueMinimo: estoqueRows.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      nome: String(row.nome),
      estoqueAtual: Number(row.estoque_atual),
      estoqueMinimo: Number(row.estoque_minimo),
      faltaParaMinimo: Number(row.estoque_minimo) - Number(row.estoque_atual)
    }))
  };
}
