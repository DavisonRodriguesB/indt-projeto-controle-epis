import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../../environments/environments';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface ColaboradorApi {
  id: number;
  nome: string;
  matricula: string;
  setor?: string;
}

export interface EpiApi {
  id: number;
  codigo: string;
  nome: string;
  ca: string;
  estoque_atual: number;
}

interface MovimentacaoItemPayload {
  epiId: number;
  quantidade: number;
}

@Injectable({ providedIn: 'root' })
export class MovimentacaoApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiUrl;

  listColaboradores(): Observable<ColaboradorApi[]> {
    return this.http
      .get<ApiResponse<ColaboradorApi[]>>(`${this.apiBaseUrl}/colaboradores`)
      .pipe(map((response) => response.data ?? []));
  }

  listEpis(pageSize = 100): Observable<EpiApi[]> {
    const params = new HttpParams()
      .set('page', '1')
      .set('pageSize', String(pageSize));

    return this.http
      .get<ApiResponse<EpiApi[]>>(`${this.apiBaseUrl}/epis`, { params })
      .pipe(map((response) => response.data ?? []));
  }

  createEntrega(colaboradorId: number, itens: MovimentacaoItemPayload[], observacao?: string): Observable<{ id: number }> {
    return this.http
      .post<ApiResponse<{ id: number }>>(`${this.apiBaseUrl}/movimentacoes/entrega`, {
        colaboradorId,
        itens,
        observacao
      })
      .pipe(map((response) => response.data));
  }

  createEntradaSaldo(itens: MovimentacaoItemPayload[], observacao?: string): Observable<{ id: number }> {
    return this.http
      .post<ApiResponse<{ id: number }>>(`${this.apiBaseUrl}/movimentacoes/entrada-saldo`, {
        itens,
        observacao
      })
      .pipe(map((response) => response.data));
  }
}
