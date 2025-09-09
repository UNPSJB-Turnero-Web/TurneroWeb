import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
     //DESARROLLO: acceso libre a todas las rutas
    return true; // quitar esta línea para activar la protección de rutas


    //PRODUCCION: rutas protegidas
    
    const userRole = localStorage.getItem('userRole');
    
    if (userRole) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
