import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService, Role } from '../inicio-sesion/auth.service';

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
    //return true; // quitar esta línea para activar la protección de rutas


    //PRODUCCION: rutas protegidas
    
    // Verificar si está autenticado
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/ingresar']);
      return false;
    }

    // Verificar si tiene rol de medico o superior según jerarquía
    return this.authService.hasRole(Role.MEDICO);
  }
}
