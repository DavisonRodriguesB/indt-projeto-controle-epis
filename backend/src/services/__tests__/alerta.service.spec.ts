const queryMock = jest.fn();

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    query: (...args: unknown[]) => queryMock(...args)
  }
}));

import { listAlertas, listMovimentacoesRecentes } from "../alerta.service";

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

  it("should build protocol with numeric year for recent movements", async () => {
    queryMock.mockResolvedValueOnce([
      {
        id: 25,
        tipo: "entrada_saldo",
        data_movimentacao: "Mon Apr 19 2026 00:00:00 GMT-0300",
        observacao: null,
        usuario_id: 1,
        usuario_nome: "Sistema",
        colaborador_id: null,
        colaborador_nome: null,
        total_itens: 1,
        total_quantidade: 2
      }
    ]);

    const result = await listMovimentacoesRecentes(
      { id: 1, nome: "Admin", email: "admin@teste.com", role: "admin" },
      8
    );

    expect(result[0].protocolo).toBe("MOV-2026-000025");
  });
});
