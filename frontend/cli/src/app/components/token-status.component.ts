import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../inicio-sesion/auth.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-token-status',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card mb-3" *ngIf="showDebugInfo">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="mb-0">Estado del Token (Debug)</h6>
        <button 
          class="btn btn-sm btn-outline-secondary" 
          (click)="toggleVisibility()">
          {{isVisible ? 'Ocultar' : 'Mostrar'}}
        </button>
      </div>
      <div class="card-body" *ngIf="isVisible">
        <div class="row">
          <div class="col-md-6">
            <p class="mb-1">
              <strong>Estado:</strong> 
              <span [class]="getStatusClass()">{{tokenInfo.hasToken ? 'Token presente' : 'Sin token'}}</span>
            </p>
            <p class="mb-1">
              <strong>Expirará:</strong> 
              <span [class]="getExpirationClass()">{{tokenInfo.isExpired ? 'Expirado' : 'Válido'}}</span>
            </p>
            <p class="mb-1">
              <strong>Tiempo restante:</strong> 
              <span [class]="getTimeLeftClass()">{{tokenInfo.timeLeft}}</span>
            </p>
            <p class="mb-1" *ngIf="tokenInfo.expiresAt">
              <strong>Expira en:</strong> 
              <small>{{tokenInfo.expiresAt | date:'short'}}</small>
            </p>
          </div>
          <div class="col-md-6">
            <p class="mb-1">
              <strong>Auto-refresh:</strong> 
              <span class="text-success">Activo</span>
            </p>
            <p class="mb-1" *ngIf="isExpiringSoon">
              <i class="fas fa-exclamation-triangle text-warning"></i>
              <span class="text-warning ms-1">Token próximo a expirar</span>
            </p>
            <div class="mt-2">
              <button 
                class="btn btn-sm btn-primary me-2" 
                (click)="refreshToken()"
                [disabled]="!tokenInfo.hasToken">
                Renovar Token
              </button>
              <button 
                class="btn btn-sm btn-danger" 
                (click)="clearSession()"
                [disabled]="!tokenInfo.hasToken">
                Limpiar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      font-size: 0.875rem;
    }
    .text-expired {
      color: #dc3545 !important;
    }
    .text-valid {
      color: #198754 !important;
    }
    .text-warning-time {
      color: #fd7e14 !important;
    }
  `]
})
export class TokenStatusComponent implements OnInit, OnDestroy {
  tokenInfo: any = {
    hasToken: false,
    isExpired: true,
    expiresAt: null,
    timeLeft: 'N/A'
  };
  
  isExpiringSoon = false;
  isVisible = false;
  showDebugInfo = false;
  private subscription?: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Solo mostrar en desarrollo o si está configurado
    this.showDebugInfo = this.authService.isAuthenticated() && 
                        (window.location.hostname === 'localhost' || 
                         localStorage.getItem('show-token-debug') === 'true');

    if (this.showDebugInfo) {
      this.updateTokenInfo();
      // Actualizar cada 30 segundos
      this.subscription = interval(30000).subscribe(() => {
        this.updateTokenInfo();
      });
    }
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  updateTokenInfo() {
    this.tokenInfo = this.authService.getTokenInfo();
    this.isExpiringSoon = this.authService.isTokenExpiringSoon();
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  getStatusClass(): string {
    return this.tokenInfo.hasToken ? 'text-success' : 'text-danger';
  }

  getExpirationClass(): string {
    return this.tokenInfo.isExpired ? 'text-expired' : 'text-valid';
  }

  getTimeLeftClass(): string {
    if (this.tokenInfo.timeLeft === 'Expirado' || this.tokenInfo.timeLeft === 'No token') {
      return 'text-expired';
    }
    if (this.isExpiringSoon) {
      return 'text-warning-time';
    }
    return 'text-valid';
  }

  refreshToken() {
    // Forzar refresh del token
    this.authService.refreshAccessToken().subscribe({
      next: () => {
        this.updateTokenInfo();
        console.log('Token renovado manualmente');
      },
      error: (error) => {
        console.error('Error al renovar token manualmente:', error);
        this.updateTokenInfo();
      }
    });
  }

  clearSession() {
    this.authService.handleAuthError({ status: 401 }, 'Sesión limpiada manualmente por el usuario.');
  }
}