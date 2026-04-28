import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environments';

export interface AlertaValidade {
  id: number;
  nome: string;
  ca: string;
  validade: string;
  diasParaVencer: number;
  status: 'vencido' | 'vence_em_breve';
}

export interface AlertaEstoque {
  id: number;
  nome: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  faltaParaMinimo: number;
}

export interface AlertasResponse {
  validade: AlertaValidade[];
  estoqueMinimo: AlertaEstoque[];
}

export interface AlertaEventoRecente {
  eventId: string;
  eventType: 'movimentacao_entrega' | 'movimentacao_entrada_saldo' | 'novo_colaborador' | 'novo_epi';
  title: string;
  description: string;
  eventAt: string;
}

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class AlertasService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiUrl;

  listarAlertas(diasValidade = 30): Observable<AlertasResponse> {
    const params = new HttpParams().set('diasValidade', String(diasValidade));

    return this.http
      .get<ApiResponse<AlertasResponse>>(`${this.apiBaseUrl}/alertas`, { params })
      .pipe(map((response) => response.data ?? { validade: [], estoqueMinimo: [] }));
  }

  listarEventos(limite = 12): Observable<AlertaEventoRecente[]> {
    const params = new HttpParams().set('limite', String(limite));

    return this.http
      .get<ApiResponse<AlertaEventoRecente[]>>(`${this.apiBaseUrl}/alertas/eventos`, { params })
      .pipe(map((response) => response.data ?? []));
  }
}