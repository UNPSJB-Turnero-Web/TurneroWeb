import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../inicio-sesion/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  canActivate(): boolean {
     //DESARROLLO: acceso libre a todas las rutas
    //return true; // quitar esta línea para activar la protección de rutas


    //PRODUCCION: rutas protegidas
    
    if (this.authService.isAuthenticated()) {
      return true;
    } else {
      this.router.navigate(['/ingresar']);
      return false;
    }
  }
}
