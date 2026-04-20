import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';
import { AuthService } from '../../../core/auth/auth.service';

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
  private readonly apiBaseUrl = environment.apiUrl;

  constructor(
    private readonly http: HttpClient,
    private readonly authService: AuthService,
  ) {}

  listRecentMovements(limit = 8): Observable<MovimentacaoNotificacao[]> {
    const token = this.authService.getAuthToken();
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
}
