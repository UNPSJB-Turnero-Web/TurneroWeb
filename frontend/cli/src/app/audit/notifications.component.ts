import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from './notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="notifications-container">
      <div 
        *ngFor="let notification of notifications; trackBy: trackByNotification"
        class="notification"
        [class]="'notification-' + notification.type"
        [@slideIn]>
        
        <div class="notification-icon">
          <i class="fas" [class]="getIconClass(notification.type)"></i>
        </div>
        
        <div class="notification-content">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <p class="notification-message">{{ notification.message }}</p>
          
          <div class="notification-actions" *ngIf="notification.actions">
            <button 
              *ngFor="let action of notification.actions"
              class="btn notification-btn"
              [class]="'btn-' + (action.type || 'secondary')"
              (click)="action.action()">
              {{ action.label }}
            </button>
          </div>
        </div>
        
        <button 
          class="notification-close"
          (click)="removeNotification(notification.id)"
          *ngIf="!notification.actions">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .notifications-container {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 9999;
      max-width: 400px;
      width: 100%;
    }

    .notification {
      background: white;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      margin-bottom: 0.75rem;
      padding: 1rem;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      border-left: 4px solid #dee2e6;
      transition: all 0.3s ease;
      animation: slideIn 0.3s ease-out;
    }

    .notification:hover {
      transform: translateX(-4px);
      box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
    }

    .notification-success {
      border-left-color: #28a745;
    }

    .notification-error {
      border-left-color: #dc3545;
    }

    .notification-warning {
      border-left-color: #ffc107;
    }

    .notification-info {
      border-left-color: #17a2b8;
    }

    .notification-icon {
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      font-size: 0.9rem;
      color: white;
      flex-shrink: 0;
    }

    .notification-success .notification-icon {
      background: #28a745;
    }

    .notification-error .notification-icon {
      background: #dc3545;
    }

    .notification-warning .notification-icon {
      background: #ffc107;
    }

    .notification-info .notification-icon {
      background: #17a2b8;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-title {
      margin: 0 0 0.25rem 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: #2c3e50;
    }

    .notification-message {
      margin: 0;
      font-size: 0.85rem;
      color: #6c757d;
      line-height: 1.4;
    }

    .notification-actions {
      margin-top: 0.75rem;
      display: flex;
      gap: 0.5rem;
    }

    .notification-btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover {
      background: #0056b3;
    }

    .btn-secondary {
      background: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background: #545b62;
    }

    .notification-close {
      width: 20px;
      height: 20px;
      border: none;
      background: transparent;
      color: #6c757d;
      cursor: pointer;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      flex-shrink: 0;
      transition: all 0.2s ease;
    }

    .notification-close:hover {
      background: #f8f9fa;
      color: #495057;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    @media (max-width: 768px) {
      .notifications-container {
        top: 0.5rem;
        right: 0.5rem;
        left: 0.5rem;
        max-width: none;
      }

      .notification {
        padding: 0.75rem;
        margin-bottom: 0.5rem;
      }

      .notification-title {
        font-size: 0.85rem;
      }

      .notification-message {
        font-size: 0.8rem;
      }
    }
  `],
  animations: [
    // Angular animations would go here in a real implementation
  ]
})
export class NotificationsComponent implements OnInit, OnDestroy {
  notifications: Notification[] = [];
  private subscription?: Subscription;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.subscription = this.notificationService.getNotifications()
      .subscribe(notifications => {
        this.notifications = notifications;
      });
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  removeNotification(id: string): void {
    this.notificationService.removeNotification(id);
  }

  trackByNotification(index: number, notification: Notification): string {
    return notification.id;
  }

  getIconClass(type: string): string {
    switch (type) {
      case 'success':
        return 'fa-check';
      case 'error':
        return 'fa-times';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
        return 'fa-info-circle';
      default:
        return 'fa-bell';
    }
  }
}
