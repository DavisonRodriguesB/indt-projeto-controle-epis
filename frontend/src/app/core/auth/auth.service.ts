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

const TOKEN_KEY = 'token';

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

  private init(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const userData = this.decodeToken(token);
      if (userData) {
        this.state.set({
          usuario: userData,
          accessToken: token
        });
      } else {
        this.clearSession();
      }
    }
  }

  private decodeToken(token: string): Usuario | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.sub,
        nome: payload.nome,
        email: payload.email,
        perfil: payload.role
      };
    } catch {
      return null;
    }
  }

  login(email: string, senha: string): Observable<any> {
    return this.http
      .post<any>(`${environment.apiUrl}/auth/login`, { email, senha })
      .pipe(
        tap((res) => {
          const { token, user } = res.data;
          localStorage.setItem(TOKEN_KEY, token);
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
    const refreshToken = localStorage.getItem(TOKEN_KEY);
    if (!refreshToken) return new Observable(sub => sub.error('No token'));

    return this.http
      .post<any>(`${environment.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap((res) => {
          const newToken = res.data?.token;
          if (newToken) {
            localStorage.setItem(TOKEN_KEY, newToken);
            this.state.update(s => ({ ...s, accessToken: newToken }));
          }
        }),
      );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.state.set({ usuario: null, accessToken: null });
  }

  getAuthToken(): string | null {
    return this.state().accessToken ?? localStorage.getItem(TOKEN_KEY);
  }

  hasRole(perfis: string[]): boolean {
    const perfil = this.currentPerfil() as string;
    return perfil !== null && perfis.includes(perfil);
  }
}