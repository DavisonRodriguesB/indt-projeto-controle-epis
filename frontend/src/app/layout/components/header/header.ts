import { CommonModule } from '@angular/common';
import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject } from '@angular/core';
import { of, Subject, timer } from 'rxjs';
import { catchError, finalize, map, switchMap, takeUntil, timeout } from 'rxjs/operators';

import { HeaderNotificationEvent, HeaderNotificationsService } from './header-notifications.service';
import { AuthService } from '../../../core/auth/auth.service';
import { environment } from '../../../../environments/environments';

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
  notifications: HeaderNotificationEvent[] = [];
  private hasLoadedNotifications = false;
  unreadNotificationCount = 0;

  private readonly seenStorageKey = 'header.notifications.lastSeenAt';
  private readonly pollingIntervalMs = this.resolvePollingInterval();
  private lastSeenNotificationAt = 0;

  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly notificationsService: HeaderNotificationsService,
    private readonly elementRef: ElementRef<HTMLElement>
  ) {}

  ngOnInit(): void {
    this.loadLastSeenNotificationId();

    timer(0, this.pollingIntervalMs)
      .pipe(
        takeUntil(this.destroy$),
        switchMap(() => this.loadNotifications(false))
      )
      .subscribe((items) => {
        if (items) {
          this.applyNotifications(items);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleNotifications(): void {
    this.isNotificationsOpen = !this.isNotificationsOpen;

    if (this.isNotificationsOpen && (!this.hasLoadedNotifications || this.notificationError)) {
      this.refreshNotifications();
      return;
    }

    if (this.isNotificationsOpen) {
      this.markNotificationsAsRead();
    }
  }

  refreshNotifications(): void {
    this.loadNotifications(true).subscribe((items) => {
      if (items) {
        this.applyNotifications(items);
      }
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.isNotificationsOpen) return;

    const targetNode = event.target as Node | null;
    if (targetNode && !this.elementRef.nativeElement.contains(targetNode)) {
      this.isNotificationsOpen = false;
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.isNotificationsOpen = false;
    this.menuOpen = false;
  }

  get notificationCount(): number {
    return this.notifications.length;
  }

  getNotificationTitle(item: HeaderNotificationEvent): string {
    return item.title;
  }

  getNotificationDescription(item: HeaderNotificationEvent): string {
    return item.description;
  }

  getNotificationBadgeClass(item: HeaderNotificationEvent): string {
    if (item.eventType === 'movimentacao_entrega') {
      return 'bg-blue-50 text-blue-700';
    }

    if (item.eventType === 'movimentacao_entrada_saldo') {
      return 'bg-emerald-50 text-emerald-700';
    }

    if (item.eventType === 'novo_colaborador') {
      return 'bg-amber-50 text-amber-700';
    }

    return 'bg-violet-50 text-violet-700';
  }

  getNotificationBadgeLabel(item: HeaderNotificationEvent): string {
    if (item.eventType === 'movimentacao_entrega') {
      return 'ENTREGA';
    }

    if (item.eventType === 'movimentacao_entrada_saldo') {
      return 'ENTRADA';
    }

    if (item.eventType === 'novo_colaborador') {
      return 'COLAB';
    }

    return 'EPI';
  }

  private getFriendlyError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return 'Não foi possível carregar as notificações.';
  }

  private applyNotifications(items: HeaderNotificationEvent[]): void {
    this.notifications = items;
    this.hasLoadedNotifications = true;

    this.normalizeLastSeenIfAhead();

    this.recalculateUnreadCount();

    if (this.isNotificationsOpen) {
      this.markNotificationsAsRead();
    }
  }

  private recalculateUnreadCount(): void {
    this.unreadNotificationCount = this.notifications.filter(
      (item) => this.getEventTimestamp(item) > this.lastSeenNotificationAt,
    ).length;
  }

  private markNotificationsAsRead(): void {
    const maxTimestamp = this.notifications.reduce(
      (acc, item) => Math.max(acc, this.getEventTimestamp(item)),
      this.lastSeenNotificationAt,
    );
    this.lastSeenNotificationAt = maxTimestamp;
    localStorage.setItem(this.seenStorageKey, String(this.lastSeenNotificationAt));
    this.unreadNotificationCount = 0;
  }

  private loadLastSeenNotificationId(): void {
    const rawValue = localStorage.getItem(this.seenStorageKey);
    const parsed = rawValue ? Number(rawValue) : 0;
    this.lastSeenNotificationAt = Number.isFinite(parsed) ? parsed : 0;
  }

  private normalizeLastSeenIfAhead(): void {
    const maxCurrentTimestamp = this.notifications.reduce(
      (acc, item) => Math.max(acc, this.getEventTimestamp(item)),
      0,
    );

    if (this.lastSeenNotificationAt > maxCurrentTimestamp) {
      this.lastSeenNotificationAt = maxCurrentTimestamp;
      localStorage.setItem(this.seenStorageKey, String(this.lastSeenNotificationAt));
    }
  }

  private loadNotifications(showLoading = true) {
    if (this.isLoadingNotifications) {
      return of<HeaderNotificationEvent[] | null>(null);
    }

    this.isLoadingNotifications = true;
    this.notificationError = null;

    return this.notificationsService.listRecentEvents(12).pipe(
      timeout(12000),
      map((items) => items ?? []),
      catchError((error: unknown) => {
        this.notificationError = this.getFriendlyError(error);
        return of<HeaderNotificationEvent[]>([]);
      }),
      finalize(() => {
        this.isLoadingNotifications = false;
      }),
      map((items) => items as HeaderNotificationEvent[] | null)
    );
  }

  private getEventTimestamp(item: HeaderNotificationEvent): number {
    const ts = new Date(item.eventAt).getTime();
    return Number.isFinite(ts) ? ts : 0;
  }

  private resolvePollingInterval(): number {
    const configured = Number(environment.notificationsPollingMs);
    if (!Number.isFinite(configured) || configured < 5000) {
      return 15000;
    }
    return configured;
  }
}