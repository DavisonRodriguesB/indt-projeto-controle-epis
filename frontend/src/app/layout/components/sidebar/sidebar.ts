import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class SidebarComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isCadastroBaseOpen = false;
  isCollapsed = false;
  isMobileOpen = false;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isMobileOpen = false;
      });
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['admin']);
  }

  toggleCadastroBase(): void {
    this.isCadastroBaseOpen = !this.isCadastroBaseOpen;
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleMobile(): void {
    this.isMobileOpen = !this.isMobileOpen;
  }

  sair(): void {
    this.authService.logout();
  }
}