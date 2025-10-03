import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DeepLinkService } from '../services/deep-link.service';

/**
 * Componente puente para procesar enlaces profundos (deep links)
 * Este componente:
 * 1. Recibe un token desde la URL
 * 2. Valida el token con el backend
 * 3. Establece una sesión automática si el token es válido
 * 4. Redirige al usuario a la página de agenda con contexto pre-seleccionado
 */
@Component({
  selector: 'app-deep-link-bridge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container mt-5">
      <div class="row justify-content-center">
        <div class="col-md-6">
          <div class="card shadow-sm">
            <div class="card-body text-center p-5">
              <div *ngIf="loading" class="loading-state">
                <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
                  <span class="visually-hidden">Cargando...</span>
                </div>
                <h4 class="mb-2">Verificando acceso...</h4>
                <p class="text-muted">Por favor espere mientras validamos su enlace</p>
              </div>

              <div *ngIf="error" class="error-state">
                <i class="fas fa-exclamation-circle text-danger mb-3" style="font-size: 3rem;"></i>
                <h4 class="mb-2 text-danger">Error de Acceso</h4>
                <p class="text-muted mb-4">{{ errorMessage }}</p>
                <button class="btn btn-primary" (click)="goToLogin()">
                  <i class="fas fa-sign-in-alt me-2"></i>Ir al Login
                </button>
              </div>

              <div *ngIf="success" class="success-state">
                <i class="fas fa-check-circle text-success mb-3" style="font-size: 3rem;"></i>
                <h4 class="mb-2 text-success">¡Acceso Autorizado!</h4>
                <p class="text-muted">Redirigiendo a la agenda...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-state, .error-state, .success-state {
      animation: fadeIn 0.3s ease-in;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .card {
      border: none;
      border-radius: 15px;
    }

    .spinner-border {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    i.fas {
      animation: scaleIn 0.5s ease-out;
    }

    @keyframes scaleIn {
      0% {
        transform: scale(0);
      }
      50% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }
  `]
})
export class DeepLinkBridgeComponent implements OnInit {
  loading = true;
  error = false;
  success = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private deepLinkService: DeepLinkService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener token de los query params
    this.route.queryParams.subscribe(params => {
      const token = params['token'];

      if (!token) {
        this.showError('No se proporcionó un token de acceso válido.');
        return;
      }

      // Validar el token
      this.validateToken(token);
    });
  }

  /**
   * Valida el token con el backend
   */
  private validateToken(token: string): void {
    this.deepLinkService.validateDeepLink(token).subscribe({
      next: (response) => {
        if (response.status_code === 200) {
          this.showSuccess();
          
          // Esperar un momento para mostrar el mensaje de éxito
          setTimeout(() => {
            // Redirigir a la agenda de pacientes
            this.router.navigate(['/paciente-agenda']);
          }, 1500);
        } else {
          this.showError(response.status_text || 'Token inválido o expirado.');
        }
      },
      error: (err) => {
        console.error('Error al validar deep link:', err);
        
        let message = 'Ocurrió un error al validar el enlace.';
        if (err.error && err.error.status_text) {
          message = err.error.status_text;
        } else if (err.status === 0) {
          message = 'No se pudo conectar con el servidor. Verifique su conexión.';
        }
        
        this.showError(message);
      }
    });
  }

  /**
   * Muestra un mensaje de error
   */
  private showError(message: string): void {
    this.loading = false;
    this.error = true;
    this.success = false;
    this.errorMessage = message;
  }

  /**
   * Muestra un mensaje de éxito
   */
  private showSuccess(): void {
    this.loading = false;
    this.error = false;
    this.success = true;
  }

  /**
   * Redirige al login
   */
  goToLogin(): void {
    this.router.navigate(['/ingresar']);
  }
}
