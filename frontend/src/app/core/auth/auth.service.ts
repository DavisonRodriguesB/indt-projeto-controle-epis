import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { Usuario } from '../models/auth.model';
import { environment } from '../../../environments/environments';

interface AuthState {
  usuario: Usuario | null;
  accessToken: string | null;
}

const REFRESH_TOKEN_KEY = 'refreshToken';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private state = signal<AuthState>({ usuario: null, accessToken: null });

  isAuthenticated = computed(() => !!this.state().accessToken);
  currentUser = computed(() => this.state().usuario);
  currentPerfil = computed(() => this.state().usuario?.perfil ?? null);
  accessToken = computed(() => this.state().accessToken);

  constructor() {
    this.init();
  }

  getAuthToken(): string | null {
    return this.state().accessToken ?? this.getStoredToken();
  }

  private init(): void {
    const rt = this.getStoredToken();
    if (rt) {
      this.refresh().subscribe({
        error: () => this.clearSession()
      });
    }
  }

  login(email: string, senha: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(
        tap((res) => {
        
          const { token, user } = res.data;

          localStorage.setItem(REFRESH_TOKEN_KEY, token);

          this.state.set({
            usuario: {
              id: user.id,
              nome: user.nome,
              email: user.email,
              perfil: user.role 
            },
            accessToken: token
          });
        }),
      );
  }

  refresh(): Observable<any> {
    const refreshToken = this.getStoredToken() ?? '';

    return this.http
      .post<any>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          
          const newToken = res.data?.token || refreshToken;
          localStorage.setItem(REFRESH_TOKEN_KEY, newToken);
          
          if (res.data?.user) {
            this.state.set({
              usuario: {
                ...res.data.user,
                perfil: res.data.user.role
              },
              accessToken: newToken
            });
          }
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.state.set({ usuario: null, accessToken: null });
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.state.set({ usuario: null, accessToken: null });
  }

  private getStoredToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  hasRole(perfis: string[]): boolean {
    const perfil = this.currentPerfil() as string;
    return perfil !== null && perfis.includes(perfil);
  }
}