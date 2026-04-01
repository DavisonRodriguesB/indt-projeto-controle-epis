import { Routes } from '@angular/router';
import { ColaboradorFormComponent } from './features/colaboradores/pages/form/form';
import { EpiFormComponent } from './features/epis/pages/form/form';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.Login),
  },

  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
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
        path: 'epis/novo', 
        component: EpiFormComponent
      },
      {
        path: 'colaboradores',
        loadComponent: () =>
          import('./features/colaboradores/pages/list/list').then(
            (m) => m.List
          ),
      },
      { 
        path: 'colaboradores/novo', 
        component: ColaboradorFormComponent 
      },

      {
        path: 'cargos',
        loadComponent: () =>
          import('./features/configuracoes/cargos/pages/list/list').then((m) => m.List),
      },
      
      {
        path: 'setores',
        loadComponent: () =>
          import('./features/configuracoes/setores/pages/list/list').then((m) => m.List),
      },

      {
        path: 'categorias',
        loadComponent: () =>
          import('./features/configuracoes/categorias/pages/list/list').then((m) => m.CategoriasEpiComponent),
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
    ],
  },

  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: '**',
    redirectTo: 'login',
  },
];