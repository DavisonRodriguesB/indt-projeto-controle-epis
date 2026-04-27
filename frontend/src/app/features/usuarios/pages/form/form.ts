import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

type UserRole = 'admin' | 'almoxarife';

interface UsuarioFormData {
  nome: string;
  email: string;
  senha?: string;
  role: UserRole;
}

interface UsuarioEditData {
  id: number;
  nome: string;
  email: string;
  role: UserRole;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.html'
})
export class UsuarioFormComponent implements OnInit {
  @Input() userData: UsuarioEditData | null = null;
  @Input() submitError: string | null = null;
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<UsuarioFormData>();

  userForm!: FormGroup;
  showPassword = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.userForm = this.fb.group({
      nome: [this.userData?.nome || '', [Validators.required, Validators.minLength(3)]],
      email: [this.userData?.email || '', [Validators.required, Validators.email]],
      senha: ['', this.userData ? [] : [Validators.required, Validators.minLength(6)]],
      role: [this.userData?.role || 'almoxarife', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      Object.values(this.userForm.controls).forEach((control) => {
        control.markAsTouched();
      });
      return;
    }

    const payload: UsuarioFormData = {
      nome: this.userForm.value.nome,
      email: this.userForm.value.email,
      role: this.userForm.value.role
    };

    if (this.userForm.value.senha) {
      payload.senha = this.userForm.value.senha;
    }

    this.onSave.emit(payload);
  }

  close(): void {
    this.onClose.emit();
  }
}