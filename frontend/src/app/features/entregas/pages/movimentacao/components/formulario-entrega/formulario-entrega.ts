import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';

export interface EstoqueItem {
  id: number;
  codigo: string;
  material: string;
  ca: string;
  saldo: number;
}

export interface ItemMovimentacao {
  epiId: number;
  codigo: string;
  ca: string;
}

@Component({
  selector: 'app-formulario-entrega',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
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

  // Estados do Autocomplete - EPI
  searchEpi = '';
  showEpiSuggestions = false;
  erroDuplicidade: string | null = null;

  // Estados do Autocomplete - Colaborador
  searchColaborador = '';
  showColaboradorSuggestions = false;

  // Filtro de EPIs
  get estoqueFiltrado() {
    if (!this.searchEpi) return this.estoque;
    const term = this.searchEpi.toLowerCase();
    return this.estoque.filter(item => 
      item.material.toLowerCase().includes(term) || 
      item.codigo.toLowerCase().includes(term) ||
      item.ca.toLowerCase().includes(term)
    );
  }

  // Filtro de Colaboradores
  get colaboradoresFiltrados() {
    if (!this.searchColaborador) return this.colaboradores;
    const term = this.searchColaborador.toLowerCase();
    return this.colaboradores.filter(c => c.toLowerCase().includes(term));
  }

  // --- Lógica de Colaborador ---
  selecionarColaborador(nome: string) {
    this.form.get('colaborador')?.setValue(nome);
    this.searchColaborador = nome;
    this.showColaboradorSuggestions = false;
  }

  limparSelecaoColaborador() {
    this.searchColaborador = '';
    this.form.get('colaborador')?.setValue('');
    this.showColaboradorSuggestions = false;
    this.onDesafixar.emit(); // Se estiver fixado, remove a trava
  }

  // --- Lógica de EPI ---
  selecionarEpi(item: EstoqueItem) {
    if (item.saldo <= 0) return;

    const jaExiste = this.itensIncluidos.some((i) => i.epiId === item.id);
    if (jaExiste) {
      this.erroDuplicidade = `Item ${item.codigo} já está na lista.`;
      return;
    }

    this.form.get('epiId')?.setValue(item.id);
    this.searchEpi = `${item.codigo} - ${item.material}`;
    this.showEpiSuggestions = false;
    this.erroDuplicidade = null;
    this.onLimparErro.emit();
  }

  limparSelecaoEpi() {
    this.searchEpi = '';
    this.form.get('epiId')?.setValue('');
    this.showEpiSuggestions = false;
    this.erroDuplicidade = null;
    this.onLimparErro.emit();
  }

  executarInclusao() {
    if (this.form && this.form.valid && !this.erroDuplicidade) {
      this.onIncluir.emit(); 
      this.limparSelecaoEpi();
      this.form.patchValue({ quantidade: 1 });
    }
  }
}