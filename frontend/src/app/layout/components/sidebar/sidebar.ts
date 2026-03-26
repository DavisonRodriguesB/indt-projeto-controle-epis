import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importante para diretivas comuns
import { RouterModule } from '@angular/router'; // Importante para o routerLink

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], // Adicione estes dois aqui
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {}