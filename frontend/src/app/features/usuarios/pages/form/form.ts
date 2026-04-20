import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html'
})
export class UsuarioFormComponent implements OnInit {
  @Input() userData: any = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<any>();

  userForm!: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.userForm = this.fb.group({
      nome: [this.userData?.nome || '', [Validators.required, Validators.minLength(3)]],
      email: [this.userData?.email || '', [Validators.required, Validators.email]],
     
      senha: ['', this.userData ? [] : [Validators.required, Validators.minLength(6)]],
      perfil: [this.userData?.perfil || 'Almoxarife', Validators.required],
      ativo: [this.userData ? this.userData.ativo : true, Validators.required]
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      const payload = { ...this.userForm.value };
      

      if (this.userData && !payload.senha) {
        delete payload.senha;
      }

      this.onSave.emit(payload);
    } else {
      Object.values(this.userForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  close() {
    this.onClose.emit();
  }
}