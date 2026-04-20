import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { MovimentacaoQueryService, MovimentacaoRecente } from '../../../core/services/movimentacao-query.service';

export type MovimentacaoNotificacao = MovimentacaoRecente;

@Injectable({ providedIn: 'root' })
export class HeaderNotificationsService {
  constructor(
    private readonly movimentacaoQuery: MovimentacaoQueryService,
  ) {}

  listRecentMovements(limit = 8): Observable<MovimentacaoNotificacao[]> {
    return this.movimentacaoQuery.listRecentMovements(limit);
  }
}
