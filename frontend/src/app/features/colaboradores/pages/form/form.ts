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

  // Listas para alimentar os selects do HTML
  setores: any[] = [];
  cargos: any[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute 
  ) {}

  ngOnInit(): void {
    // 1. CARREGAR OS DADOS PARA OS SELECTS
    this.carregarListasAuxiliares();

    // 2. INICIALIZA O FORMULÁRIO (Incluindo o campo 'cargo')
    this.colaboradorForm = this.fb.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      matricula: ['', [Validators.required]],
      cargo: ['', [Validators.required]], // Campo adicionado
      setor: ['', [Validators.required]],
      status: ['Ativo', [Validators.required]]
    });

    this.colaboradorId = this.route.snapshot.paramMap.get('id');
    
    if (this.colaboradorId) {
      this.isEdicao = true;
      this.carregarDadosParaEdicao(this.colaboradorId);
    }
  }

  // Simula a busca de dados que você cadastrou nas outras telas
  carregarListasAuxiliares() {
    this.setores = [
      { nome: 'Operação' },
      { nome: 'Manutenção' },
      { nome: 'Logística' }
    ];

    this.cargos = [
      { nome: 'Técnico de Segurança' },
      { nome: 'Almoxarife' },
      { nome: 'Operador de Máquina' }
    ];
  }

  carregarDadosParaEdicao(id: string) {
    console.log('Modo Edição: Buscando dados do colaborador ID', id);
    // Exemplo de como preencheria o form após buscar na API:
    // this.colaboradorForm.patchValue(dadosVindoDaApi);
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