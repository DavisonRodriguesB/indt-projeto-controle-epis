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
    colaborador: '',
    data: '',
    codigo: '',
    usuario: ''
  };

  buscar() {
    this.onSearch.emit({ ...this.filtros });
  }
}