import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environments';

interface ApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

export interface HeaderNotificationEvent {
  eventId: string;
  eventType: 'movimentacao_entrega' | 'movimentacao_entrada_saldo' | 'novo_colaborador' | 'novo_epi';
  title: string;
  description: string;
  eventAt: string;
}

@Injectable({ providedIn: 'root' })
export class HeaderNotificationsService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = environment.apiUrl;

  listRecentEvents(limit = 12): Observable<HeaderNotificationEvent[]> {
    const params = new HttpParams().set('limite', String(limit));

    return this.http
      .get<ApiResponse<HeaderNotificationEvent[]>>(`${this.apiBaseUrl}/alertas/eventos`, { params })
      .pipe(map((response) => response.data ?? []));
  }
}
