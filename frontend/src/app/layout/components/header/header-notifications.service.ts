import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface MovimentacaoNotificacao {
  id: number;
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
export class HeaderNotificationsService {
  private readonly apiBaseUrl = 'http://localhost:3333/api';
  private readonly tokenKeys = ['token', 'auth_token', 'access_token', 'jwt', 'jwt_token'];

  constructor(private readonly http: HttpClient) {}

  listRecentMovements(limit = 8): Observable<MovimentacaoNotificacao[]> {
    const token = this.getStoredToken();
    if (!token) {
      return new Observable<MovimentacaoNotificacao[]>((subscriber) => {
        subscriber.error(new Error('Token nao encontrado. Faca login para ver notificacoes.'));
      });
    }

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const params = new HttpParams().set('limite', String(limit));

    return this.http
      .get<ApiResponse<MovimentacaoNotificacao[]>>(`${this.apiBaseUrl}/alertas/movimentacoes`, { headers, params })
      .pipe(map((response) => response.data ?? []));
  }

  private getStoredToken(): string | null {
    for (const key of this.tokenKeys) {
      const value = localStorage.getItem(key);
      if (value) {
        return value;
      }
    }

    const authRaw = localStorage.getItem('auth');
    if (!authRaw) {
      return null;
    }

    try {
      const authObject = JSON.parse(authRaw) as { token?: string };
      return authObject.token ?? null;
    } catch {
      return null;
    }
  }
}
