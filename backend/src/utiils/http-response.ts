import { Response } from "express";

type ApiSuccessMeta = Record<string, unknown>;

interface ApiSuccessPayload<T> {
  data: T;
  meta?: ApiSuccessMeta;
}

export function sendSuccess<T>(
  response: Response,
  statusCode: number,
  data: T,
  meta?: ApiSuccessMeta
): void {
  const payload: ApiSuccessPayload<T> = { data };

  if (meta) {
    payload.meta = meta;
  }

  response.status(statusCode).json(payload);
}