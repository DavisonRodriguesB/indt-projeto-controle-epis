const listEntregasMock = jest.fn();
const createEntregaMock = jest.fn();
const sendSuccessMock = jest.fn();

jest.mock("../../services/entrega.service", () => ({
  listEntregas: (...args: unknown[]) => listEntregasMock(...args),
  createEntrega: (...args: unknown[]) => createEntregaMock(...args)
}));

jest.mock("../../utiils/http-response", () => ({
  sendSuccess: (...args: unknown[]) => sendSuccessMock(...args)
}));

import { Request, Response } from "express";
import { handleCreateEntrega, handleListEntregas } from "../entrega.controller";

describe("entrega controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list entregas with total meta", async () => {
    listEntregasMock.mockResolvedValue([{ id: 1 }]);

    await handleListEntregas({} as Request, {} as Response);

    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 200, [{ id: 1 }], { total: 1 });
  });

  it("should throw AUTH_REQUIRED when request has no authUser", async () => {
    await expect(
      handleCreateEntrega(
        { body: { colaboradorId: 1, epiId: 2, quantidade: 1 } } as Request,
        {} as Response
      )
    ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
  });

  it("should create entrega and return 201 when authUser exists", async () => {
    await handleCreateEntrega(
      {
        authUser: { id: 7, nome: "Admin", email: "a@t.com", role: "admin" },
        body: { colaboradorId: 1, epiId: 2, quantidade: 1 }
      } as Request,
      {} as Response
    );

    expect(createEntregaMock).toHaveBeenCalledWith({ colaboradorId: 1, epiId: 2, quantidade: 1 }, 7);
    expect(sendSuccessMock).toHaveBeenCalledWith(expect.anything(), 201, { created: true });
  });
});
