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
    colaborador_id: '', 
    dataInicio: '',
    dataFim: '',
    mesReferencia: '',
    protocolo: '',
    usuario: '',
    codigoMaterial: '',
    ca: ''
  };

  sugestoesColaboradores: any[] = [];
  exibirSugestoes = false;
  buscandoSugestoes = false;
  
  private searchSubject = new Subject<string>();
  private searchSubscription: Subscription;

  meses = [
    { valor: '01', nome: 'Janeiro' }, { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' }, { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' }, { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' }, { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' }, { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' }, { valor: '12', nome: 'Dezembro' }
  ];

  constructor(private consultaService: ConsultaService) {
    this.searchSubscription = this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(termo => {
        if (!termo || termo.length < 3) {
          this.buscandoSugestoes = false;
          return of([]);
        }
        this.buscandoSugestoes = true;
        return this.consultaService.buscarSugestoesColaboradores(termo);
      })
    ).subscribe({
      next: (res: any) => {
        this.sugestoesColaboradores = res;
        this.exibirSugestoes = res.length > 0;
        this.buscandoSugestoes = false;
      },
      error: () => this.buscandoSugestoes = false
    });
  }

  // Método chamado pelo (input) do HTML
  buscarColaboradores(termo: string) {
    if (!termo) {
      this.filtros.colaborador_id = '';
      this.exibirSugestoes = false;
    }
    this.searchSubject.next(termo);
  }

  selecionarColaborador(colab: any) {
    // ANALISTA: Vinculamos o nome para visualização e o ID para o filtro real
    this.filtros.colaboradorMatricula = `${colab.nome} (${colab.matricula})`;
    this.filtros.colaborador_id = colab.id; 
    this.exibirSugestoes = false;
  }

  fecharSugestoes() {
    setTimeout(() => { this.exibirSugestoes = false; }, 250);
  }

  buscar() {
    // Emite os filtros atuais para o componente pai
    this.onSearch.emit({ ...this.filtros });
  }

  limpar() {
    // Reseta o objeto de filtros localmente
    this.filtros = {
      colaboradorMatricula: '',
      colaborador_id: '',
      dataInicio: '',
      dataFim: '',
      mesReferencia: '',
      protocolo: '',
      usuario: '',
      codigoMaterial: '',
      ca: ''
    };
    this.sugestoesColaboradores = [];
    
    // ANALISTA: Enviamos 'null' para o pai entender que deve 
    // apenas limpar a tabela, sem buscar no banco.
    this.onSearch.emit(null); 
  }

  ngOnDestroy() {
    if (this.searchSubscription) this.searchSubscription.unsubscribe();
  }
}