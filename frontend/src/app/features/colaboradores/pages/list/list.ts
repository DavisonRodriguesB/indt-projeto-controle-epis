import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Definição da interface baseada na entidade do Backend
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
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './list.html',
  styleUrls: ['./list.css']
})

export class List {
  // Dados de exemplo (Seed) para visualização
  colaboradores: Colaborador[] = [
    { id: 1, nome: 'Davison Bentes', matricula: '202601', cargo: 'Operador de Máquina', setor: 'Produção', ativo: true },
    { id: 2, nome: 'Denise Cibele', matricula: '202602', cargo: 'Técnico de Manutenção', setor: 'Engenharia', ativo: true },
    { id: 3, nome: 'Bruce Wayne', matricula: '202603', cargo: 'Auxiliar de Logística', setor: 'Almoxarifado', ativo: false },
  ];

  searchTerm: string = '';

  // Função para filtrar (Simulação de busca)
  get colaboradoresFiltrados() {
    return this.colaboradores.filter(c => 
      c.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      c.matricula.includes(this.searchTerm)
    );
    
  }
  // Função para confirmar exclusão (Simulação)
  confirmarExclusao(id: number, nome: string) {
  const confirmou = confirm(`Deseja realmente excluir o colaborador ${nome}?`);
    if (confirmou) {
      console.log('Solicitando exclusão ao backend para o ID:', id);
      // Aqui chamaremos o service.delete futuramente
      alert('Colaborador excluído (Simulação)');
    }
  }
}