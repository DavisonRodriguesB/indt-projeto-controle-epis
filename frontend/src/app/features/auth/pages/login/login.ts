import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  
  imports: [ReactiveFormsModule],
  templateUrl: './login.html'
})
export class LoginComponent {
  form: FormGroup;
  error: string | null = null;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  entrar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.error = null;

    const { email, password } = this.form.value;

    
    console.log('Tentando acesso com:', email);

    if (email === 'admin@epipim.com.br' && password === '123456') {
      
      this.router.navigate(['/dashboard']);
    } else {
      
      this.error = 'E-mail ou senha incorretos. Verifique suas credenciais.';
      this.loading = false;
    }
  }
}