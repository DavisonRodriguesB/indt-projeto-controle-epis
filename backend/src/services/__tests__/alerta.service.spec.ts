const queryMock = jest.fn();

jest.mock("../../database/data-source", () => ({
  AppDataSource: {
    query: (...args: unknown[]) => queryMock(...args)
  }
}));

import { listAlertas } from "../alerta.service";

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
});
