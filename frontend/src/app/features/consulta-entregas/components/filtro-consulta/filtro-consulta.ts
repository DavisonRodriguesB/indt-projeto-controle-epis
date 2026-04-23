import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultaService } from '../../../../core/services/consulta.service';

@Component({
  selector: 'app-filtro-consulta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filtro-consulta.html'
})
export class FiltroConsultaComponent {
  @Output() onSearch = new EventEmitter<any>();

  filtros = {
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

  meses = [
    { valor: '01', nome: 'Janeiro' }, { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' }, { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' }, { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' }, { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' }, { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' }, { valor: '12', nome: 'Dezembro' }
  ];

  constructor(private consultaService: ConsultaService) {}

  buscarColaboradores(termo: string) {
    if (!termo || termo.length < 3) {
      this.sugestoesColaboradores = [];
      this.exibirSugestoes = false;
      this.filtros.colaborador_id = ''; 
      return;
    }

    this.buscandoSugestoes = true;
    this.consultaService.buscarSugestoesColaboradores(termo).subscribe({
      next: (res: any) => {
        this.sugestoesColaboradores = res; 
        this.exibirSugestoes = this.sugestoesColaboradores.length > 0;
        this.buscandoSugestoes = false;
      },
      error: () => {
        this.buscandoSugestoes = false;
        this.exibirSugestoes = false;
      }
    });
  }

  selecionarColaborador(colab: any) {
    this.filtros.colaboradorMatricula = `${colab.nome} (${colab.matricula})`;
    this.filtros.colaborador_id = colab.id; 
    this.exibirSugestoes = false;
  }

  fecharSugestoes() {
    setTimeout(() => this.exibirSugestoes = false, 300);
  }

  buscar() {
    this.exibirSugestoes = false;
    this.onSearch.emit({ ...this.filtros });
  }

  limpar() {
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
    this.onSearch.emit({ ...this.filtros });
  }
}