import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// FASE 3: Definição da interface baseada na entidade do Backend
interface Colaborador {
  id: number;
  nome: string;
  matricula: string;
  cargo: string;
  setor: string;
  ativo: boolean;
}

@Component({
  selector: 'app-colaborador-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})
export class List {
  // FASE 3: Dados de exemplo (Seed) para visualização
  colaboradores: Colaborador[] = [
    { id: 1, nome: 'Davison Bentes', matricula: 'MT-2024-01', cargo: 'Operador de Máquina', setor: 'Produção', ativo: true },
    { id: 2, nome: 'Denise Cibele', matricula: 'MT-2024-05', cargo: 'Técnico de Manutenção', setor: 'Engenharia', ativo: true },
    { id: 3, nome: 'Bruce Wayne', matricula: 'MT-2023-99', cargo: 'Auxiliar de Logística', setor: 'Almoxarifado', ativo: false },
  ];

  searchTerm: string = '';

  // FASE 3: Função para filtrar (Simulação de busca)
  get colaboradoresFiltrados() {
    return this.colaboradores.filter(c => 
      c.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      c.matricula.includes(this.searchTerm)
    );
  }
}