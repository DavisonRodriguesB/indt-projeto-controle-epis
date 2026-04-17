import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const roleGuard = (...roles: string[]): CanActivateFn =>
  () => {
    const auth = inject(AuthService);
    if (auth.hasRole(roles)) return true;
    return inject(Router).createUrlTree(['/403']);
  };