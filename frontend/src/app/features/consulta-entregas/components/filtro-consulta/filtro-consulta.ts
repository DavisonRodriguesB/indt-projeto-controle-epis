import { Component, EventEmitter, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../../../core/services/consulta.service';
import { Subject, debounceTime, distinctUntilChanged, switchMap, Subscription, of } from 'rxjs';

@Component({
  selector: 'app-filtro-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-consulta.html'
})
export class FiltroConsultaComponent implements OnDestroy {
  @Output() onSearch = new EventEmitter<any>();

  /**
   * Nomes dos filtros alinhados com o querySchema do backend:
   *   colaborador_id  → z.coerce.number().optional()
   *   data_inicio     → z.string().optional()   (era dataInicio no frontend — ERRADO)
   *   data_fim        → z.string().optional()   (era dataFim no frontend — ERRADO)
   *   ca              → z.string().optional()
   *
   * Campos sem suporte no backend atual (ignorados na busca):
   *   protocolo, usuario, codigoMaterial, mesReferencia
   */
  filtros: any = {
    colaboradorLabel: '',  // campo de exibição apenas (não enviado)
    colaborador_id:   '',
    data_inicio:      '',
    data_fim:         '',
    mesReferencia:    '',  // mantido no HTML — sem suporte no backend atual
    protocolo:        '',  // mantido no HTML — sem suporte no backend atual
    usuario:          '',  // mantido no HTML — sem suporte no backend atual
    codigoMaterial:   '',  // mantido no HTML — sem suporte no backend atual
    ca:               ''
  };

  // Necessário para o select de mês no HTML
  meses = [
    { valor: '01', nome: 'Janeiro'   }, { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março'     }, { valor: '04', nome: 'Abril'     },
    { valor: '05', nome: 'Maio'      }, { valor: '06', nome: 'Junho'     },
    { valor: '07', nome: 'Julho'     }, { valor: '08', nome: 'Agosto'    },
    { valor: '09', nome: 'Setembro'  }, { valor: '10', nome: 'Outubro'   },
    { valor: '11', nome: 'Novembro'  }, { valor: '12', nome: 'Dezembro'  }
  ];

  sugestoesColaboradores: any[] = [];
  exibirSugestoes  = false;
  buscandoSugestoes = false;

  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  constructor(private consultaService: ConsultaService) {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termo => {
        if (!termo || termo.length < 2) {
          this.buscandoSugestoes = false;
          this.exibirSugestoes   = false;
          return of([]);
        }
        this.buscandoSugestoes = true;
        return this.consultaService.buscarSugestoesColaboradores(termo);
      })
    ).subscribe({
      next: (res: any[]) => {
        this.sugestoesColaboradores = res;
        this.exibirSugestoes        = res.length > 0;
        this.buscandoSugestoes      = false;
      },
      error: () => { this.buscandoSugestoes = false; }
    });
  }

  buscarColaboradores(termo: string): void {
    if (!termo) {
      this.filtros.colaborador_id = '';
      this.exibirSugestoes        = false;
    }
    this.searchSubject.next(termo);
  }

  selecionarColaborador(colab: any): void {
    this.filtros.colaboradorLabel = `${colab.nome} (${colab.matricula})`;
    this.filtros.colaborador_id   = colab.id;
    this.exibirSugestoes          = false;
  }

  fecharSugestoes(): void {
    setTimeout(() => { this.exibirSugestoes = false; }, 250);
  }

  buscar(): void {
    // Monta apenas os filtros que o backend conhece
    const payload: any = {};

    if (this.filtros.colaborador_id) payload.colaborador_id = this.filtros.colaborador_id;
    if (this.filtros.data_inicio)    payload.data_inicio    = this.filtros.data_inicio;
    if (this.filtros.data_fim)       payload.data_fim       = this.filtros.data_fim;
    if (this.filtros.ca)             payload.ca             = this.filtros.ca;

    this.onSearch.emit(payload);
  }

  limpar(): void {
    this.filtros = {
      colaboradorLabel: '',
      colaborador_id:   '',
      data_inicio:      '',
      data_fim:         '',
      mesReferencia:    '',
      protocolo:        '',
      usuario:          '',
      codigoMaterial:   '',
      ca:               ''
    };
    this.sugestoesColaboradores = [];
    this.exibirSugestoes        = false;
    this.onSearch.emit(null);
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}