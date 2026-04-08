import { Response } from "express";
import { sendSuccess } from "../http-response";

describe("sendSuccess", () => {
  function createResponseMock() {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return { status, json };
  }

  it("should send payload with data only", () => {
    const responseMock = createResponseMock();

    sendSuccess(responseMock as unknown as Response, 200, { ok: true });

    expect(responseMock.status).toHaveBeenCalledWith(200);
    expect(responseMock.json).toHaveBeenCalledWith({ data: { ok: true } });
  });

  it("should send payload with data and meta", () => {
    const responseMock = createResponseMock();

    sendSuccess(responseMock as unknown as Response, 200, [1, 2], { total: 2 });

    expect(responseMock.json).toHaveBeenCalledWith({
      data: [1, 2],
      meta: { total: 2 }
    });
  });
});
