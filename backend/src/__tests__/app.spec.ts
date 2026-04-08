import request from "supertest";
import { app } from "../app";

describe("app integration", () => {
  it("should return health status", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: "ok" } });
  });

  it("should return 404 with ROUTE_NOT_FOUND for unknown route", async () => {
    const response = await request(app).get("/rota-que-nao-existe");

    expect(response.status).toBe(404);
    expect(response.body.code).toBe("ROUTE_NOT_FOUND");
  });

  it("should return AUTH_TOKEN_MISSING for protected route without token", async () => {
    const response = await request(app).get("/api/epis");

    expect(response.status).toBe(401);
    expect(response.body.code).toBe("AUTH_TOKEN_MISSING");
  });

  it("should return VALIDATION_ERROR for invalid login payload", async () => {
    const response = await request(app).post("/api/auth/login").send({ email: "invalido", senha: "123" });

    expect(response.status).toBe(400);
    expect(response.body.code).toBe("VALIDATION_ERROR");
  });
});
