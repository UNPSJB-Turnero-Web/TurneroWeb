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
  templateUrl: './deep-link-brigde.component.html',
  styleUrl: './deep-link-bridge.component.css'
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
