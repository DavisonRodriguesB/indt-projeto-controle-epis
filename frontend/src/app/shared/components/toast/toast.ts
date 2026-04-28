// src/app/shared/components/toast/toast.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.html'
})
export class ToastComponent {
  
  private notificationService = inject(NotificationService);

  notif$ = this.notificationService.notification$;

  close() {
    this.notificationService.hide();
  }
}