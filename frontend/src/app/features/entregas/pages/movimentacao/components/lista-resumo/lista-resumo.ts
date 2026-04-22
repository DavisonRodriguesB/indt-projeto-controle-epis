import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-lista-resumo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-resumo.html'
})
export class ListaResumo { 
  @Input() itens: any[] = [];
  @Input() colaboradorFixado: string | null = null;
  @Input() enviando = false;
  
  @Output() onRemover = new EventEmitter<number>();
  @Output() onFinalizar = new EventEmitter<void>();
}