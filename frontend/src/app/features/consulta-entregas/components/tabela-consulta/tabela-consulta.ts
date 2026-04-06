import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-tabela-consulta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './tabela-consulta.html'
})
export class TabelaConsultaComponent {
  @Input() entregas: any[] = [];
  @Output() onView = new EventEmitter<any>();

  visualizar(item: any) {
    this.onView.emit(item);
  }
}