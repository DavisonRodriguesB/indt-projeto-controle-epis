import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BaseItem } from '../../../../../../../core/models/base-item.model';


@Component({
  selector: 'app-modal-cargo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-cargo.html'
})
export class ModalCargo implements OnChanges {
  @Input() isOpen = false;
  @Input() cargoParaEdicao: BaseItem | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{id?: number, descricao: string}>();

  formCargo: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formCargo = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['cargoParaEdicao']?.currentValue) {
      this.formCargo.patchValue({ descricao: this.cargoParaEdicao?.descricao });
    } else if (changes['isOpen']?.currentValue === true && !this.cargoParaEdicao) {
      this.formCargo.reset();
    }
  }

  handleClose() {
    this.formCargo.reset();
    this.onClose.emit();
  }

  handleSave() {
    if (this.formCargo.valid) {
      this.onSave.emit({
        id: this.cargoParaEdicao?.id,
        descricao: this.formCargo.value.descricao
      });
      this.handleClose();
    } else {
      this.formCargo.markAllAsTouched();
    }
  }
}