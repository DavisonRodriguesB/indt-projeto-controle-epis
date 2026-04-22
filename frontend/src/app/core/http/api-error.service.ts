import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface BackendErrorPayload {
  message?: string;
  error?: {
    message?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  getMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse) {
      const payload = error.error as BackendErrorPayload | null;
      const payloadMessage = payload?.message ?? payload?.error?.message;

      if (typeof payloadMessage === 'string' && payloadMessage.trim()) {
        return payloadMessage;
      }

      if (typeof error.message === 'string' && error.message.trim()) {
        return error.message;
      }
    }

    if (error instanceof Error && error.message.trim()) {
      return error.message;
    }

    return fallbackMessage;
  }
}
