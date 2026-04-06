import { Component } from '@angular/core';
import { CommonModule } from '@angular/common'; 
import { RouterModule, NavigationEnd, Router } from '@angular/router'; 
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule], 
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  isCadastroBaseOpen = false;
  isCollapsed = false; // Controle Desktop
  isMobileOpen = false; // Controle Mobile

  constructor(private router: Router) {
    // Fecha o menu mobile automaticamente ao clicar em um link
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.isMobileOpen = false;
    });
  }

  toggleCadastroBase() {
    this.isCadastroBaseOpen = !this.isCadastroBaseOpen;
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobile() {
    this.isMobileOpen = !this.isMobileOpen;
  }
}