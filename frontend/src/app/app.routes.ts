import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then(
        (m) => m.Login
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/pages/home/home').then(
        (m) => m.Home
      ),
  },
  {
    path: 'epis',
    loadComponent: () =>
      import('./features/epis/pages/list/list').then(
        (m) => m.List
      ),
  },
  {
    path: 'colaboradores',
    loadComponent: () =>
      import('./features/colaboradores/pages/list/list').then(
        (m) => m.List
      ),
  },
  {
    path: 'entregas',
    loadComponent: () =>
      import('./features/entregas/pages/list/list').then(
        (m) => m.List
      ),
  },
  {
    path: 'usuarios',
    loadComponent: () =>
      import('./features/usuarios/pages/list/list').then(
        (m) => m.List
      ),
  },
  {
    path: '**',
    redirectTo: 'login',
  },
];