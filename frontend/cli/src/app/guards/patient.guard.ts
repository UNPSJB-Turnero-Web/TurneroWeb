import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class PatientGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean {
    const userRole = localStorage.getItem('userRole');
    
    if (userRole === 'patient') {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }
}
