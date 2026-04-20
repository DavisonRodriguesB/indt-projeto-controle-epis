import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private auth = inject(AuthService);

  form: FormGroup;
  error = signal<string | null>(null);
  loading = signal(false);

  constructor() {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  entrar() {
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);

    
    const email = this.form.get('email')?.value;
    const password = this.form.get('password')?.value;

    this.auth.login(email, password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); 
      },
      
      error: (err: HttpErrorResponse) => {
        this.loading.set(false);
        const msg = err?.error?.message || 'Falha na autenticação. Verifique suas credenciais.';
        this.error.set(msg);
      }
    });
  }
}