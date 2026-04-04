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
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<string>();

  formSetor: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formSetor = this.fb.group({
      nomeSetor: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  handleClose() {
    this.formSetor.reset();
    this.onClose.emit();
  }

  handleSave() {
    if (this.formSetor.valid) {
      this.onSave.emit(this.formSetor.value.nomeSetor);
      this.handleClose();
    } else {
      this.formSetor.markAllAsTouched();
    }
  }
}