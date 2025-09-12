import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DataPackage } from '../data.package';
import { fadeInAnimation, slideUpAnimation } from '../animations';
import { ActivacionCuentaService } from './activacion-cuenta.service';

@Component({
  selector: 'app-activacion-cuenta',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activacion-cuenta.component.html',
  styleUrls: ['./activacion-cuenta.component.css'],
  animations: [fadeInAnimation, slideUpAnimation]
})
export class ActivacionCuentaComponent implements OnInit {
  
  isLoading = true;
  isActivated = false;
  errorMessage = '';
  successMessage = '';
  token = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private activacionService: ActivacionCuentaService
  ) {}

  ngOnInit(): void {
    // Obtener el token de los parámetros de la URL
    this.token = this.route.snapshot.queryParams['token'];
    
    if (this.token) {
      this.activateAccount();
    } else {
      this.isLoading = false;
      this.errorMessage = 'Token de activación no encontrado en la URL.';
    }
  }

  /**
   * Activa la cuenta automáticamente al cargar el componente
   */
  private activateAccount(): void {
    this.activacionService.activateAccount(this.token)
      .subscribe({
        next: (response: DataPackage<any>) => {
          this.isLoading = false;
          
          if (response.status_code === 200) {
            this.isActivated = true;
            this.successMessage = response.status_text || 'Tu cuenta ha sido activada exitosamente.';
          } else {
            this.errorMessage = response.status_text || 'Error al activar la cuenta.';
          }
        },
        error: (error: any) => {
          this.isLoading = false;
          console.error('Error al activar cuenta:', error);
          
          if (error.status === 400) {
            this.errorMessage = error.error?.status_text || 'El token de activación es inválido o ha expirado.';
          } else if (error.status === 404) {
            this.errorMessage = 'No se encontró una cuenta asociada a este token.';
          } else if (error.status === 409) {
            this.errorMessage = 'Esta cuenta ya ha sido activada previamente.';
          } else if (error.status === 500) {
            this.errorMessage = 'Error interno del servidor. Por favor, intenta más tarde.';
          } else {
            this.errorMessage = error.error?.status_text || 'Error inesperado al activar la cuenta.';
          }
        }
      });
  }

  /**
   * Redirige al usuario a la página de login
   */
  navigateToLogin(): void {
    this.router.navigate(['/ingresar']);
  }

  /**
   * Solicita reenvío del email de activación
   */
  resendActivationEmail(): void {
    // Aquí podrías implementar la lógica para reenviar el email
    // Por ahora, redirigimos al registro o login
    this.router.navigate(['/registro']);
  }
}