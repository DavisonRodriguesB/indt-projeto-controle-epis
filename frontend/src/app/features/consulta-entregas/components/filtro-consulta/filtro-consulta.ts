import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
    dataInicio: '',
    dataFim: '',
    mesReferencia: '',
    protocolo: '',
    usuario: '',
    codigoMaterial: '',
    ca: ''
  };

  
  meses = [
    { valor: '01', nome: 'Janeiro' }, { valor: '02', nome: 'Fevereiro' },
    { valor: '03', nome: 'Março' }, { valor: '04', nome: 'Abril' },
    { valor: '05', nome: 'Maio' }, { valor: '06', nome: 'Junho' },
    { valor: '07', nome: 'Julho' }, { valor: '08', nome: 'Agosto' },
    { valor: '09', nome: 'Setembro' }, { valor: '10', nome: 'Outubro' },
    { valor: '11', nome: 'Novembro' }, { valor: '12', nome: 'Dezembro' }
  ];

  buscar() {
    this.onSearch.emit({ ...this.filtros });
  }

  limpar() {
    this.filtros = {
      colaboradorMatricula: '',
      dataInicio: '',
      dataFim: '',
      mesReferencia: '',
      protocolo: '',
      usuario: '',
      codigoMaterial: '',
      ca: ''
    };
  }
}