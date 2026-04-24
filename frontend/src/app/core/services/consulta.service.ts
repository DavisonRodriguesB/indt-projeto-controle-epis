import { Injectable } from '@angular/core'; // CORRIGIDO: Era @angular/common
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environments';
import { EntregaCompleta } from '../models/consulta.model';

@Injectable({ providedIn: 'root' })
export class ConsultaService {
  private readonly API = `${environment.apiUrl}/consultas/entregas`;

  constructor(private http: HttpClient) {}

  buscarSugestoesColaboradores(termo: string): Observable<any[]> {
    const params = new HttpParams().set('search', termo);
    return this.http.get<any>(`${environment.apiUrl}/colaboradores/sugestoes`, { params }).pipe(
      map(res => res.data || res)
    );
  }

  buscarEntregas(filtros: any): Observable<EntregaCompleta[]> {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      const valor = filtros[key];
      if (valor !== '' && valor !== null && valor !== undefined) {
        params = params.append(key, valor);
      }
    });

    return this.http.get<any>(this.API, { params }).pipe(
      map(res => this.agruparEntregas(res.data || []))
    );
  }

  private agruparEntregas(dados: any[]): EntregaCompleta[] {
    const mapa = new Map();

    dados.forEach(row => {
      const id = row.movimentacao_id || row.id;
      
      if (!mapa.has(id)) {
        mapa.set(id, {
          id: id.toString(),
          colaborador: row.colaborador_nome || 'Não Identificado',
          matricula: row.colaborador_matricula || 'N/A',
          setor: row.setor_nome || row.setor || 'Geral',
          cargo: row.cargo_nome || row.cargo || 'Não Informado',
          data_hora: row.data_movimentacao || row.data_hora,
          usuario_emissor: row.usuario_nome || 'Sistema',
          itens: [],
          total_itens: 0
        });
      }
      
      const e = mapa.get(id);
      e.itens.push({
        id: row.item_id,
        nome: row.epi_nome || row.material || 'EPI não identificado',
        quantidade: row.quantidade || 0,
        numero_ca: row.epi_ca || row.numero_ca || row.ca || 'S/CA',
        codigo_material: row.epi_codigo || row.codigo_material || row.codigo || 'N/A'
      });
      e.total_itens += row.quantidade;
    });

    return Array.from(mapa.values());
  }
}