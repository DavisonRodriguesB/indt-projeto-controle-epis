import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

interface BackendErrorPayload {
  code?: string;
  message?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
  error?: {
    message?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class ApiErrorService {
  getMessage(error: unknown, fallbackMessage: string): string {
    if (error instanceof HttpErrorResponse && error.status === 0) {
      return 'Nao foi possivel conectar ao servidor.      Invoke-WebRequest http://localhost:3333/api/health -UseBasicParsing';
    }

    if (error instanceof HttpErrorResponse) {
      const payload = error.error as BackendErrorPayload | null;

      if (payload?.code === 'VALIDATION_ERROR') {
        const validationMessage = this.getValidationMessage(payload.details);

        if (validationMessage) {
          return validationMessage;
        }
      }

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

  private getValidationMessage(details: BackendErrorPayload['details']): string | null {
    if (!details) {
      return null;
    }

    const parts: string[] = [];

    if (Array.isArray(details.formErrors) && details.formErrors.length > 0) {
      parts.push(...details.formErrors.filter((message) => message.trim().length > 0));
    }

    if (details.fieldErrors) {
      for (const [field, messages] of Object.entries(details.fieldErrors)) {
        if (!Array.isArray(messages) || messages.length === 0) {
          continue;
        }

        const normalizedField = this.formatFieldName(field);
        parts.push(`${normalizedField}: ${messages.join(', ')}`);
      }
    }

    if (parts.length === 0) {
      return null;
    }

    return `Corrija os campos antes de continuar: ${parts.join(' | ')}`;
  }

  private formatFieldName(field: string): string {
    const normalized = field.replace(/_/g, ' ').trim();

    if (!normalized) {
      return 'Campo';
    }

    return normalized.charAt(0).toUpperCase() + normalized.slice(1);
  }
}
