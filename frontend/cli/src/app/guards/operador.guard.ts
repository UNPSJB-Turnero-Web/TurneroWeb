import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../inicio-sesion/auth.service';

@Injectable({
  providedIn: 'root'
})
export class OperadorGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
    // Verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/ingresar']);
      return false;
    }

    // Verificar si tiene rol de operador
    const userRole = this.authService.getUserRole();
    
    if (userRole === 'OPERADOR') {
      return true;
    } else {
      return false;
    }
  }
}
