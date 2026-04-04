import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-entrada-saldo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-entrada-saldo.html'
})
export class ModalEntradaSaldo { 
  @Input() isOpen = false;
  @Input() form!: FormGroup;
  @Input() estoque: any[] = [];
  @Input() nomeArquivo: string | null = null;

  @Output() onClose = new EventEmitter<void>();
  @Output() onFile = new EventEmitter<any>();
  @Output() onSalvar = new EventEmitter<void>();
}