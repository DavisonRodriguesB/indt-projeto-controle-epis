import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ensureAuthenticated, ensureRole } from "./auth";
import { AppError } from "./error-handler";

jest.mock("jsonwebtoken", () => ({
  verify: jest.fn()
}));

describe("auth middleware", () => {
  const next = jest.fn() as NextFunction;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should throw AUTH_TOKEN_MISSING when authorization header is absent", () => {
    const request = { headers: {} } as Request;

    expect(() => ensureAuthenticated(request, {} as Response, next)).toThrow(AppError);

    try {
      ensureAuthenticated(request, {} as Response, next);
    } catch (error) {
      expect((error as AppError).code).toBe("AUTH_TOKEN_MISSING");
    }
  });

  it("should throw AUTH_TOKEN_INVALID when token format is invalid", () => {
    const request = { headers: { authorization: "Bearer" } } as Request;

    expect(() => ensureAuthenticated(request, {} as Response, next)).toThrow(AppError);

    try {
      ensureAuthenticated(request, {} as Response, next);
    } catch (error) {
      expect((error as AppError).code).toBe("AUTH_TOKEN_INVALID");
    }
  });

  it("should attach authUser and call next when token is valid", () => {
    const request = { headers: { authorization: "Bearer token-valido" } } as Request;
    const jwtMock = jwt as jest.Mocked<typeof jwt>;

    jwtMock.verify.mockReturnValue({
      sub: "12",
      nome: "Usuario",
      email: "usuario@teste.com",
      role: "admin"
    } as never);

    ensureAuthenticated(request, {} as Response, next);

    expect(request.authUser).toEqual({
      id: 12,
      nome: "Usuario",
      email: "usuario@teste.com",
      role: "admin"
    });
    expect(next).toHaveBeenCalledTimes(1);
  });

  it("should throw AUTH_REQUIRED when role is missing", () => {
    const request = {} as Request;
    const middleware = ensureRole(["admin"]);

    expect(() => middleware(request, {} as Response, next)).toThrow(AppError);

    try {
      middleware(request, {} as Response, next);
    } catch (error) {
      expect((error as AppError).code).toBe("AUTH_REQUIRED");
    }
  });

  it("should throw AUTH_FORBIDDEN when user role is not allowed", () => {
    const request = { authUser: { role: "almoxarife" } } as Request;
    const middleware = ensureRole(["admin"]);

    expect(() => middleware(request, {} as Response, next)).toThrow(AppError);

    try {
      middleware(request, {} as Response, next);
    } catch (error) {
      expect((error as AppError).code).toBe("AUTH_FORBIDDEN");
    }
  });

  it("should call next when user role is allowed", () => {
    const request = { authUser: { role: "admin" } } as Request;
    const middleware = ensureRole(["admin", "almoxarife"]);

    middleware(request, {} as Response, next);

    expect(next).toHaveBeenCalledTimes(1);
  });
});
