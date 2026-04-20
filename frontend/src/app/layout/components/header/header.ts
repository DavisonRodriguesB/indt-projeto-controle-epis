import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { of, Subject, timer } from 'rxjs';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';

import { HeaderNotificationsService, MovimentacaoNotificacao } from './header-notifications.service';
import { AuthService } from '../../../core/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent implements OnInit, OnDestroy {

  // ===== AUTH / USER =====
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

  // ===== NOTIFICATIONS =====
  isNotificationsOpen = false;
  isLoadingNotifications = false;
  notificationError: string | null = null;
  notifications: MovimentacaoNotificacao[] = [];

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly notificationsService: HeaderNotificationsService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    timer(0, 60000)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => {
          this.isLoadingNotifications = true;
          this.notificationError = null;

          return this.notificationsService.listRecentMovements(8).pipe(
            catchError((error: unknown) => {
              this.notifications = [];
              this.notificationError = this.getFriendlyError(error);
              this.isLoadingNotifications = false;
              return of<MovimentacaoNotificacao[]>([]);
            })
          );
        })
      )
      .subscribe((items) => {
        this.notifications = items;
        this.isLoadingNotifications = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isNotificationsOpen) return;

    const targetNode = event.target as Node | null;
    if (targetNode && !this.elementRef.nativeElement.contains(targetNode)) {
      this.isNotificationsOpen = false;
    }
  }

  get notificationCount(): number {
    return this.notifications.length;
  }

  getNotificationTitle(item: MovimentacaoNotificacao): string {
    return item.tipo === 'entrega' ? 'Entrega de EPI' : 'Entrada de saldo';
  }

  getNotificationDescription(item: MovimentacaoNotificacao): string {
    const destino = item.colaboradorNome ? ` para ${item.colaboradorNome}` : '';
    const totalItensLabel = item.totalItens === 1 ? 'item' : 'itens';
    return `${item.usuarioNome}${destino} (${item.totalItens} ${totalItensLabel}, qtd ${item.totalQuantidade})`;
  }

  private getFriendlyError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Não foi possível carregar as notificações.';
  }
}