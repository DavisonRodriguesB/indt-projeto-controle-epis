const listAlertasMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.mock("../../services/alerta.service", () => ({
  listAlertas: (...args: unknown[]) => listAlertasMock(...args)
}));

jest.mock("../../utiils/http-response", () => ({
  sendSuccess: (...args: unknown[]) => sendSuccessMock(...args)
}));

import { Request, Response } from "express";
import { handleListAlertas } from "../alerta.controller";

describe("alerta controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should use default diasValidade=30 when query is missing", async () => {
    listAlertasMock.mockResolvedValue({ validade: [], estoqueMinimo: [] });

    await handleListAlertas({ query: {} } as unknown as Request, {} as Response);

    expect(listAlertasMock).toHaveBeenCalledWith(30);
    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, { validade: [], estoqueMinimo: [] }, {
      diasValidade: 30,
      totalValidade: 0,
      totalEstoqueMinimo: 0
    });
  });

  it("should parse diasValidade from query", async () => {
    listAlertasMock.mockResolvedValue({ validade: [{ id: 1 }], estoqueMinimo: [] });

    await handleListAlertas({ query: { diasValidade: "45" } } as unknown as Request, {} as Response);

    expect(listAlertasMock).toHaveBeenCalledWith(45);
  });
});
