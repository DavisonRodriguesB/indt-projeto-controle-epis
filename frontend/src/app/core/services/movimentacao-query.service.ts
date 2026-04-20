import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, finalize, map, Observable, of, shareReplay, throwError } from 'rxjs';
import { environment } from '../../../environments/environments';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface MovimentacaoRecente {
  id: number;
  protocolo: string;
  tipo: 'entrega' | 'entrada_saldo';
  dataMovimentacao: string;
  observacao: string | null;
  usuarioId: number;
  usuarioNome: string;
  colaboradorId: number | null;
  colaboradorNome: string | null;
  totalItens: number;
  totalQuantidade: number;
}

@Injectable({ providedIn: 'root' })
export class MovimentacaoQueryService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiUrl;
  private readonly inFlightByLimit = new Map<number, Observable<MovimentacaoRecente[]>>();

  listRecentMovements(limit = 8): Observable<MovimentacaoRecente[]> {
    const cachedRequestForThisLimit = this.inFlightByLimit.get(limit);
    if (cachedRequestForThisLimit) {
      return cachedRequestForThisLimit;
    }

    const params = new HttpParams().set('limite', String(limit));

    const request$ = this.http
      .get<ApiResponse<MovimentacaoRecente[]>>(`${this.apiBaseUrl}/movimentacoes/recentes`, { params })
      .pipe(
        map((response) => response.data ?? []),
        catchError((error: { status?: number }) => {
          if (error?.status === 404) {
            return of([]);
          }

          return throwError(() => error);
        }),
        finalize(() => {
          this.inFlightByLimit.delete(limit);
        }),
        shareReplay(1),
      );

    this.inFlightByLimit.set(limit, request$);
    return request$;
  }
}
