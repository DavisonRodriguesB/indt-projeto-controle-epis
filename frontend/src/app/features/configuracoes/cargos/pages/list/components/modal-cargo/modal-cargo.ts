import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-cargo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-cargo.html'
})
export class ModalCargo {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<string>();

  formCargo: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formCargo = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  handleClose() {
   
    this.formCargo.reset();
    this.onClose.emit();
  }

  handleSave() {
    if (this.formCargo.valid) {
  
      this.onSave.emit(this.formCargo.value.descricao);
      
      
      this.handleClose();
    } else {
      
      this.formCargo.markAllAsTouched();
    }
  }
}