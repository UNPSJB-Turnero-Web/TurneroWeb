import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../inicio-sesion/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MedicoGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {

     //DESARROLLO: acceso libre a todas las rutas
    return true; // quitar esta línea para activar la protección de rutas


    //PRODUCCION: rutas protegidas
    
    // Verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/ingresar']);
      return false;
    }

    // Verificar si tiene rol de medico
    const userRole = this.authService.getUserRole();
    
    if (userRole === 'MEDICO') {
      return true;
    } else {
      return false;
    }
  }
}
