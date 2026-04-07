import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
  colaboradores: Colaborador[] = [
    { id: 1, nome: 'Tony Stark', matricula: '202601', cargo: 'Operador de Máquina', setor: 'Produção', ativo: true },
    { id: 2, nome: 'Steve Rogers', matricula: '202602', cargo: 'Técnico de Manutenção', setor: 'Engenharia', ativo: true },
    { id: 3, nome: 'Bruce Wayne', matricula: '202603', cargo: 'Auxiliar de Logística', setor: 'Almoxarifado', ativo: false },
  ];

  searchTerm: string = '';
  selectedSetor: string = ''; 

  get setores(): string[] {
    return [...new Set(this.colaboradores.map(c => c.setor))].sort();
  }

  get colaboradoresFiltrados() {
    return this.colaboradores.filter(c => {
      const matchesSearch = c.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
                            c.matricula.includes(this.searchTerm);
      const matchesSetor = this.selectedSetor === '' || c.setor === this.selectedSetor;
      return matchesSearch && matchesSetor;
    });
  }


  toggleStatus(item: Colaborador) {
    item.ativo = !item.ativo;
    console.log(`Status do colaborador ${item.nome} alterado para: ${item.ativo ? 'Ativo' : 'Inativo'}`);
    
  }
}