import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning';
  visible: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private notificationSubject = new BehaviorSubject<Notification>({
    message: '',
    type: 'success',
    visible: false
  });

  notification$ = this.notificationSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'warning' = 'success') {
    this.notificationSubject.next({ message, type, visible: true });
    
    setTimeout(() => {
      this.hide();
    }, 3000);
  }

  hide() {
    const current = this.notificationSubject.value;
    this.notificationSubject.next({ ...current, visible: false });
  }
}