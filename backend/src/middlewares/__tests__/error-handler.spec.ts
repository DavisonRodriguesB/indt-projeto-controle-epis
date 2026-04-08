import { Request, Response } from "express";
import { z } from "zod";
import { AppError, errorHandler } from "../error-handler";

describe("errorHandler", () => {
  function createResponseMock() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return { status, json };
  }

  it("should return 400 for ZodError", () => {
    const schema = z.object({ nome: z.string().min(2) });
    let validationError: Error;

    try {
      schema.parse({ nome: "a" });
      throw new Error("expected zod error");
    } catch (error) {
      validationError = error as Error;
    }

    const responseMock = createResponseMock();

    errorHandler(validationError!, {} as Request, responseMock as unknown as Response, jest.fn());

    expect(responseMock.status).toHaveBeenCalledWith(400);
    expect(responseMock.json).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "VALIDATION_ERROR",
        message: "Erro de validacao."
      })
    );
  });

  it("should return AppError payload and status", () => {
    const error = new AppError(403, "Sem permissao", "AUTH_FORBIDDEN", { role: "almoxarife" });
    const responseMock = createResponseMock();

    errorHandler(error, {} as Request, responseMock as unknown as Response, jest.fn());

    expect(responseMock.status).toHaveBeenCalledWith(403);
    expect(responseMock.json).toHaveBeenCalledWith({
      code: "AUTH_FORBIDDEN",
      message: "Sem permissao",
      details: { role: "almoxarife" }
    });
  });

  it("should return 500 for unknown errors", () => {
    const responseMock = createResponseMock();

    errorHandler(new Error("falha"), {} as Request, responseMock as unknown as Response, jest.fn());

    expect(responseMock.status).toHaveBeenCalledWith(500);
    expect(responseMock.json).toHaveBeenCalledWith({
      code: "INTERNAL_SERVER_ERROR",
      message: "Erro interno do servidor.",
      details: null
    });
  });
});
