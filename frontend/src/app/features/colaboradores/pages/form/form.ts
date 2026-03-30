import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-colaborador-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form.html',
  styles: ``
})
export class ColaboradorFormComponent implements OnInit {
  colaboradorForm!: FormGroup;
  isEdicao = false;
  colaboradorId: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute // Necessário para ler o ID da rota
  ) {}

  ngOnInit(): void {
    // Inicializa a estrutura do formulário
    this.colaboradorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      matricula: ['', [Validators.required]],
      setor: ['', [Validators.required]]
    });

    // Verifica se existe um ID na rota (ex: /colaboradores/editar/1)
    this.colaboradorId = this.route.snapshot.paramMap.get('id');
    
    if (this.colaboradorId) {
      this.isEdicao = true;
      this.carregarDadosParaEdicao(this.colaboradorId);
    }
  }

  carregarDadosParaEdicao(id: string) {
    console.log('Modo Edição: Buscando dados do colaborador ID', id);
    
  }

  onSubmit() {
    if (this.colaboradorForm.valid) {
      const dadosColaborador = this.colaboradorForm.value;
      
      if (this.isEdicao) {
        console.log('Atualizando colaborador (PUT):', this.colaboradorId, dadosColaborador);
        alert('Colaborador atualizado com sucesso!');
      } else {
        console.log('Criando novo colaborador (POST):', dadosColaborador);
        alert('Colaborador cadastrado com sucesso!');
      }
      
      this.router.navigate(['/colaboradores']);
    } else {
      this.colaboradorForm.markAllAsTouched();
    }
  }
}