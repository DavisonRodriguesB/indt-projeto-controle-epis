import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BaseItem } from '../../../../../../../core/models/base-item.model';


@Component({
  selector: 'app-modal-categoria',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-categoria.html'
})
export class ModalCategoria implements OnChanges {
  @Input() isOpen = false;
  @Input() categoriaParaEdicao: BaseItem | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<{id?: number, descricao: string}>();

  formCategoria: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formCategoria = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['categoriaParaEdicao']?.currentValue) {
      this.formCategoria.patchValue({ descricao: this.categoriaParaEdicao?.descricao });
    } else if (changes['isOpen']?.currentValue === true && !this.categoriaParaEdicao) {
      this.formCategoria.reset();
    }
  }

  handleClose() {
    this.formCategoria.reset();
    this.onClose.emit();
  }

  handleSave() {
    if (this.formCategoria.valid) {
      this.onSave.emit({
        id: this.categoriaParaEdicao?.id,
        descricao: this.formCategoria.value.descricao
      });
      this.handleClose();
    } else {
      this.formCategoria.markAllAsTouched();
    }
  }
}