import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('token');

  if (auth.isAuthenticated() || !!token) {
    return true;
  }
  
  return router.createUrlTree(['/login']);
};