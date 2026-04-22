import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

interface EstoqueItem {
  id: number;
  codigo: string;
  material: string;
  ca: string;
  saldo: number;
}

interface ItemMovimentacao {
  epiId: number;
  codigo: string;
  ca: string;
}

@Component({
  selector: 'app-formulario-entrega',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-entrega.html'
})
export class FormularioEntrega { 
  @Input() form!: FormGroup;
  @Input() colaboradores: string[] = [];
  @Input() estoque: EstoqueItem[] = [];
  @Input() erroSaldo: string | null = null;
  @Input() colaboradorFixado: string | null = null;
  @Input() itensIncluidos: ItemMovimentacao[] = [];

  @Output() onIncluir = new EventEmitter<void>();
  @Output() onDesafixar = new EventEmitter<void>();
  @Output() onLimparErro = new EventEmitter<void>();

  erroDuplicidade: string | null = null;

  onEpiChange(event: Event) {
    const value = Number((event.target as HTMLSelectElement).value);
    if (!value) {
      this.erroDuplicidade = null;
      return;
    }

    const jaExiste = this.itensIncluidos.some((item) => item.epiId === value);
    if (jaExiste) {
      const itemEncontrado = this.estoque.find((item) => item.id === value);
      this.erroDuplicidade = `Item ${itemEncontrado?.codigo ?? ''} já está na lista.`.trim();
      this.form.get('epiId')?.setValue('');
      return;
    }

    this.erroDuplicidade = null;
    this.onLimparErro.emit();
  }

  executarInclusao() {
    if (this.form.valid && !this.erroDuplicidade) {
      this.onIncluir.emit(); 
      this.form.get('epiId')?.reset(); 
      this.form.patchValue({ quantidade: 1 });
    }
  }
}