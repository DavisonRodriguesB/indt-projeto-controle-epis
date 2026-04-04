import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-categoria.html'
})
export class ModalCategoria {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<string>();

  formCategoria: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formCategoria = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  handleClose() {
    this.formCategoria.reset();
    this.onClose.emit();
  }

  handleSave() {
    if (this.formCategoria.valid) {
      this.onSave.emit(this.formCategoria.value.nome);
      this.handleClose();
    } else {
      this.formCategoria.markAllAsTouched();
    }
  }
}