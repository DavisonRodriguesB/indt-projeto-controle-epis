import { Component, inject } from '@angular/core';
import { AuthService } from '../../../core/auth/auth.service';


@Component({
  selector: 'app-header',
  standalone: true,
  imports: [],
  templateUrl: './header.html'
})
export class HeaderComponent {
  
  private authService = inject(AuthService);

  
  user = this.authService.currentUser;
  menuOpen = false;

  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  logout() {
    this.menuOpen = false;
    this.authService.logout();
  }

  getInitial(): string {
    
    return this.user()?.nome?.charAt(0).toUpperCase() || 'U';
  }
}