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

  @Output() onIncluir = new EventEmitter<void>();
  @Output() onDesafixar = new EventEmitter<void>();
  @Output() onLimparErro = new EventEmitter<void>();
}