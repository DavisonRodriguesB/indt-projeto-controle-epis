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

  filtros: any = {
    colaboradorMatricula: '', 
    colaborador_id:      '',
    dataInicio:          '',
    dataFim:             '',
    mesReferencia:       '',
    protocolo:           '',
    usuario:             '',
    codigoMaterial:      '',
    ca:                  ''
  };

  meses = [
    { valor: '01', nome: 'Janeiro'   }, { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março'     }, { valor: '04', nome: 'Abril'     },
    { valor: '05', nome: 'Maio'      }, { valor: '06', nome: 'Junho'     },
    { valor: '07', nome: 'Julho'     }, { valor: '08', nome: 'Agosto'    },
    { valor: '09', nome: 'Setembro'  }, { valor: '10', nome: 'Outubro'   },
    { valor: '11', nome: 'Novembro'  }, { valor: '12', nome: 'Dezembro'  }
  ];

  sugestoesColaboradores: any[] = [];
  exibirSugestoes   = false;
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
      this.limparColaborador();
    }
    this.searchSubject.next(termo);
  }

  selecionarColaborador(colab: any): void {
    this.filtros.colaboradorMatricula = `${colab.nome} (${colab.matricula})`;
    this.filtros.colaborador_id       = colab.id;
    this.exibirSugestoes              = false;
  }

  limparColaborador(): void {
    this.filtros.colaboradorMatricula = '';
    this.filtros.colaborador_id       = '';
    this.sugestoesColaboradores       = [];
    this.exibirSugestoes              = false;
  }

  fecharSugestoes(): void {
    setTimeout(() => { this.exibirSugestoes = false; }, 250);
  }

  buscar(): void {
    const payload: any = {};

    if (this.filtros.colaborador_id) payload.colaborador_id = this.filtros.colaborador_id;
    if (this.filtros.dataInicio)     payload.data_inicio    = this.filtros.dataInicio;
    if (this.filtros.dataFim)        payload.data_fim       = this.filtros.dataFim;
    if (this.filtros.ca)              payload.ca             = this.filtros.ca;
    if (this.filtros.protocolo)       payload.protocolo      = this.filtros.protocolo;

    this.onSearch.emit(payload);
  }

  limpar(): void {
    this.filtros = {
      colaboradorMatricula: '',
      colaborador_id:      '',
      dataInicio:          '',
      dataFim:             '',
      mesReferencia:       '',
      protocolo:           '',
      usuario:             '',
      codigoMaterial:      '',
      ca:                  ''
    };
    this.sugestoesColaboradores = [];
    this.exibirSugestoes        = false;
    this.onSearch.emit(null);
  }

  ngOnDestroy(): void {
    this.searchSubscription?.unsubscribe();
  }
}