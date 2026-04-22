const queryMock = jest.fn();

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    query: (...args: unknown[]) => queryMock(...args)
  }
}));

import { listAlertas, listEventosRecentes } from "../alerta.service";

describe("alerta service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should map validade and estoque alerts correctly", async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          id: 1,
          nome: "Capacete",
          ca: "123",
          validade: "2026-03-20",
          dias_para_vencer: -2
        },
        {
          id: 2,
          nome: "Luva",
          ca: "456",
          validade: "2026-03-30",
          dias_para_vencer: 8
        }
      ])
      .mockResolvedValueOnce([
        {
          id: 3,
          nome: "Oculos",
          estoque_atual: 3,
          estoque_minimo: 5
        }
      ]);

    const result = await listAlertas(15);

    expect(result.validade).toEqual([
      {
        id: 1,
        nome: "Capacete",
        ca: "123",
        validade: "2026-03-20",
        diasParaVencer: -2,
        status: "vencido"
      },
      {
        id: 2,
        nome: "Luva",
        ca: "456",
        validade: "2026-03-30",
        diasParaVencer: 8,
        status: "vence_em_breve"
      }
    ]);

    expect(result.estoqueMinimo).toEqual([
      {
        id: 3,
        nome: "Oculos",
        estoqueAtual: 3,
        estoqueMinimo: 5,
        faltaParaMinimo: 2
      }
    ]);

    expect(queryMock).toHaveBeenCalledTimes(2);
    expect(queryMock).toHaveBeenNthCalledWith(1, expect.stringContaining("WHERE validade <= CURRENT_DATE"), [15]);
  });

  it("should merge movement, collaborator and EPI events", async () => {
    queryMock
      .mockResolvedValueOnce([
        {
          id: 30,
          tipo: "entrada_saldo",
          event_at: "2026-04-20T11:00:00.000Z",
          usuario_id: 1,
          usuario_nome: "Administrador",
          colaborador_nome: null,
          total_itens: 1,
          total_quantidade: 2
        }
      ])
      .mockResolvedValueOnce([
        {
          id: 15,
          nome: "Tony Stark",
          matricula: "202601",
          created_at: "2026-04-20T11:02:00.000Z"
        }
      ])
      .mockResolvedValueOnce([
        {
          id: 7,
          nome: "Capacete X",
          codigo: "102940",
          created_at: "2026-04-20T11:01:00.000Z"
        }
      ]);

    const result = await listEventosRecentes(
      { id: 1, nome: "Admin", email: "admin@teste.com", role: "admin" },
      8
    );

    expect(result.map((item) => item.eventType)).toEqual([
      "novo_colaborador",
      "novo_epi",
      "movimentacao_entrada_saldo"
    ]);
    expect(result[0].title).toBe("Novo colaborador");
  });
});
