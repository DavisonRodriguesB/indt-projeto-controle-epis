import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-setor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-setor.html'
})
export class ModalSetor {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<string>();

  formSetor: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formSetor = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  handleClose() {
    this.formSetor.reset();
    this.close.emit();
  }

  handleSave() {
    if (this.formSetor.valid) {
      const valorDescricao = this.formSetor.get('descricao')?.value;
      this.confirm.emit(valorDescricao);
      this.handleClose();
    } else {
      this.formSetor.markAllAsTouched();
    }
  }
}