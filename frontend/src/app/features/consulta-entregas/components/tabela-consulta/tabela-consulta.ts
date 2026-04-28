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

  paginaAtual: number = 1;
  itensPorPagina: number = 5;

  get entregasPaginadas(): any[] {
    const inicio = (this.paginaAtual - 1) * this.itensPorPagina;
    const fim = inicio + this.itensPorPagina;
    return this.entregas.slice(inicio, fim);
  }

  get totalPaginas(): number {
    return Math.ceil(this.entregas.length / this.itensPorPagina);
  }

  get listaDePaginas(): number[] {
    return Array.from({ length: this.totalPaginas }, (_, i) => i + 1);
  }

  mudarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaAtual = pagina;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  visualizar(item: any) {
    this.onView.emit(item);
  }

  formatarProtocolo(item: any): string {
    const data = item.data_hora ? new Date(item.data_hora) : new Date();
    const ano = isNaN(data.getFullYear()) ? new Date().getFullYear() : data.getFullYear();
    return `MOV-${ano}-${item.id.toString().padStart(6, '0')}`;
  }
}