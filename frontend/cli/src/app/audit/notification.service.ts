import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: () => void;
  type?: 'primary' | 'secondary';
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications$ = new BehaviorSubject<Notification[]>([]);

  constructor() {}

  getNotifications(): Observable<Notification[]> {
    return this.notifications$.asObservable();
  }

  showSuccess(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'success',
      title,
      message,
      duration
    });
  }

  showError(title: string, message: string, duration: number = 8000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'error',
      title,
      message,
      duration
    });
  }

  showWarning(title: string, message: string, duration: number = 6000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      duration
    });
  }

  showInfo(title: string, message: string, duration: number = 5000): void {
    this.addNotification({
      id: this.generateId(),
      type: 'info',
      title,
      message,
      duration
    });
  }

  showConfirmation(
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ): void {
    const actions: NotificationAction[] = [
      {
        label: 'Confirmar',
        action: () => {
          onConfirm();
          this.removeNotification(notification.id);
        },
        type: 'primary'
      },
      {
        label: 'Cancelar',
        action: () => {
          if (onCancel) onCancel();
          this.removeNotification(notification.id);
        },
        type: 'secondary'
      }
    ];

    const notification: Notification = {
      id: this.generateId(),
      type: 'warning',
      title,
      message,
      actions
    };

    this.addNotification(notification);
  }

  removeNotification(id: string): void {
    const current = this.notifications$.value;
    const filtered = current.filter(n => n.id !== id);
    this.notifications$.next(filtered);
  }

  clearAll(): void {
    this.notifications$.next([]);
  }

  private addNotification(notification: Notification): void {
    const current = this.notifications$.value;
    this.notifications$.next([...current, notification]);

    // Auto-remove after duration if specified
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.removeNotification(notification.id);
      }, notification.duration);
    }
  }

  private generateId(): string {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Métodos específicos para auditoría
  auditSuccess(action: string, details?: string): void {
    this.showSuccess(
      'Auditoría Exitosa',
      `${action}${details ? ': ' + details : ''}`,
      4000
    );
  }

  auditError(action: string, error?: string): void {
    this.showError(
      'Error en Auditoría',
      `Error al ${action.toLowerCase()}${error ? ': ' + error : ''}`,
      6000
    );
  }

  conflictDetected(turnoId: number, conflictType: string): void {
    this.showWarning(
      'Conflicto Detectado',
      `Se detectó un conflicto en el turno #${turnoId}: ${conflictType}`,
      8000
    );
  }

  exportComplete(format: string, filename: string): void {
    this.showSuccess(
      'Exportación Completa',
      `Archivo ${format.toUpperCase()} generado: ${filename}`,
      3000
    );
  }
}
