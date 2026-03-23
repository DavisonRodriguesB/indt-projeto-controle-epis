const listColaboradoresMock = jest.fn();
const createColaboradorMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.mock("../services/colaborador.service", () => ({
  listColaboradores: (...args: unknown[]) => listColaboradoresMock(...args),
  createColaborador: (...args: unknown[]) => createColaboradorMock(...args)
}));

jest.mock("../utiils/http-response", () => ({
  sendSuccess: (...args: unknown[]) => sendSuccessMock(...args)
}));

import { Request, Response } from "express";
import { handleCreateColaborador, handleListColaboradores } from "./colaborador.controller";

describe("colaborador controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list colaboradores with total meta", async () => {
    listColaboradoresMock.mockResolvedValue([{ id: 1 }]);

    await handleListColaboradores({} as Request, {} as Response);

    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, [{ id: 1 }], { total: 1 });
  });

  it("should create colaborador and return 201", async () => {
    createColaboradorMock.mockResolvedValue({ id: 10 });

    await handleCreateColaborador(
      {
        body: {
          nome: "Ana",
          matricula: "M-10",
          setor: "RH"
        }
      } as Request,
      {} as Response
    );

    expect(createColaboradorMock).toHaveBeenCalled();
    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 201, { id: 10 });
  });
});
