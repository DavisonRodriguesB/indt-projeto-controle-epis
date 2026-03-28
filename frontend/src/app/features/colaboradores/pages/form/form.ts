import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-colaborador-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form.html',
  styles: ``
})
export class ColaboradorFormComponent implements OnInit {
  colaboradorForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Estrutura colaborador.service.ts
    this.colaboradorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      matricula: ['', [Validators.required]],
      setor: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.colaboradorForm.valid) {
      // Coleta os dados
      const dadosColaborador = this.colaboradorForm.value;
      
      console.log('Dados prontos para o service:', dadosColaborador);
      
      // Simulação de sucesso antes da integração com o HttpClient
      alert('Colaborador cadastrado com sucesso!');
      this.router.navigate(['/colaboradores']);
    } else {
      // Ativa as mensagens de erro visuais no HTML
      this.colaboradorForm.markAllAsTouched();
    }
  }
}