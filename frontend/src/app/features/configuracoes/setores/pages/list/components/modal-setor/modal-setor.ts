import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { BaseItem } from '../../../../../../../core/models/base-item.model';


@Component({
  selector: 'app-modal-setor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './modal-setor.html'
})
export class ModalSetor implements OnChanges {
  @Input() isOpen = false;
  @Input() setorParaEdicao: BaseItem | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<{ id?: number, descricao: string }>();

  formSetor: FormGroup;

  constructor(private fb: FormBuilder) {
    this.formSetor = this.fb.group({
      descricao: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['setorParaEdicao']?.currentValue) {
      this.formSetor.patchValue({
        descricao: this.setorParaEdicao?.descricao
      });
    } else if (changes['isOpen']?.currentValue === true && !this.setorParaEdicao) {
      this.formSetor.reset();
    }
  }

  handleClose() {
    this.formSetor.reset();
    this.close.emit();
  }

  handleSave() {
    if (this.formSetor.valid) {
      const valorDescricao = this.formSetor.get('descricao')?.value;
      this.confirm.emit({ 
        id: this.setorParaEdicao?.id, 
        descricao: valorDescricao 
      });
      this.handleClose();
    } else {
      this.formSetor.markAllAsTouched();
    }
  }
}