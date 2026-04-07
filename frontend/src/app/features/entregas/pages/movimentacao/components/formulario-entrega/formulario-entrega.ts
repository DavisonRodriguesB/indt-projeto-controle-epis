import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-formulario-entrega',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario-entrega.html'
})
export class FormularioEntrega { 
  @Input() form!: FormGroup;
  @Input() colaboradores: string[] = [];
  @Input() estoque: any[] = [];
  @Input() erroSaldo: string | null = null;
  @Input() colaboradorFixado: string | null = null;
  
  
  @Input() materialFixado: string | null = null;
  @Input() itensIncluidos: any[] = [];

  @Output() onIncluir = new EventEmitter<void>();
  @Output() onDesafixar = new EventEmitter<void>();
  @Output() onDesafixarMaterial = new EventEmitter<void>();
  @Output() onLimparErro = new EventEmitter<void>();

  erroDuplicidade: string | null = null;

  verificarSelecao(event: any) {
    const valor = event.target.value;
    const itemEncontrado = this.estoque.find(item => 
      `${item.codigo} - ${item.material} (CA: ${item.ca})` === valor
    );

    if (itemEncontrado) {
      
      const jaExiste = this.itensIncluidos.some(i => 
        String(i.codigo).trim() === String(itemEncontrado.codigo).trim() && 
        String(i.ca).trim() === String(itemEncontrado.ca).trim()
      );
      
      if (jaExiste) {
        this.erroDuplicidade = `Item (CA: ${itemEncontrado.ca}) já está na lista.`;
        this.materialFixado = null;
        this.form.get('material')?.setValue('');
        return;
      }

      this.erroDuplicidade = null;
      this.materialFixado = valor;
      this.onLimparErro.emit();
    }
  }

  limparMaterial() {
    this.materialFixado = null;
    this.erroDuplicidade = null;
    this.form.get('material')?.setValue('');
    this.onDesafixarMaterial.emit();
  }

  executarInclusao() {
    if (this.form.valid && !this.erroDuplicidade) {
      this.onIncluir.emit(); 
      this.materialFixado = null; 
      
      this.form.get('material')?.reset(); 
      this.form.patchValue({ quantidade: 1 });
    }
  }
}