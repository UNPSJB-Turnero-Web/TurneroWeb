import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { fadeInAnimation, slideUpAnimation, pulseAnimation, logoAnimation } from '../animations';

interface User {
  email: string;
  password: string;
  name: string;
  role: string;
  roleClass: string;
}

interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inicio-sesion.component.html',
  styleUrl: './inicio-sesion.component.css',
  animations: [fadeInAnimation, slideUpAnimation, pulseAnimation, logoAnimation]
})
export class InicioSesionComponent {
  currentStep: 'email' | 'password' = 'email';
  isLoading = false;
  showPassword = false;
  showEmailError = false;
  showPasswordError = false;
  userAccount: User | null = null;
  pulseState = 'idle';

  loginData: LoginData = {
    email: '',
    password: '',
    rememberMe: false
  };

  // Base de datos simulada de usuarios
  private users: User[] = [
    {
      email: 'juan.perez@email.com',
      password: 'test1234',
      name: 'Juan Pérez',
      role: 'Paciente',
      roleClass: 'paciente'
    },
    {
      email: 'dra.martinez@hospital.com',
      password: 'medico123',
      name: 'Dra. María Martínez',
      role: 'Médico',
      roleClass: 'medico'
    },
    {
      email: 'operador@cheturno.com',
      password: 'op123456',
      name: 'Carlos Operador',
      role: 'Operador',
      roleClass: 'operador'
    },
    {
      email: 'admin@cheturno.com',
      password: 'admin123',
      name: 'Administrador Sistema',
      role: 'Administrador',
      roleClass: 'admin'
    }
  ];

  constructor(private router: Router) {
    // Para testing - mostrar credenciales de prueba
    console.log('Credenciales de prueba:');
    this.users.forEach(user => {
      console.log(`${user.role}: ${user.email} / ${user.password}`);
    });
  }

  handleSubmit(form: NgForm): void {
    if (this.currentStep === 'email') {
      this.handleEmailSubmit();
    } else if (this.currentStep === 'password') {
      this.handlePasswordSubmit();
    }
  }

  private handleEmailSubmit(): void {
    if (!this.validateEmailStep()) {
      return;
    }

    this.isLoading = true;
    
    // Simular búsqueda en el servidor
    setTimeout(() => {
      const user = this.findUserByEmail(this.loginData.email);
      
      if (user) {
        this.userAccount = user;
        this.currentStep = 'password';
        this.isLoading = false;
        
        // Enfocar el campo de contraseña después de un breve delay
        setTimeout(() => {
          const passwordField = document.getElementById('password');
          if (passwordField) {
            passwordField.focus();
          }
        }, 100);
      } else {
        // Email no encontrado
        this.showEmailError = true;
        this.isLoading = false;
      }
    }, 1000);
  }

  private handlePasswordSubmit(): void {
    if (!this.validatePasswordStep()) {
      return;
    }

    this.isLoading = true;
    
    setTimeout(() => {
      if (this.userAccount && this.userAccount.password === this.loginData.password) {
        // Login exitoso
        console.log(`Login exitoso como ${this.userAccount.role}`);
        alert(`¡Login exitoso como ${this.userAccount.role}! Redirigiendo al panel principal...`);
        
        // Aquí puedes redirigir según el rol del usuario
        this.redirectByRole(this.userAccount.roleClass);
        
        this.isLoading = false;
      } else {
        // Contraseña incorrecta
        this.showPasswordError = true;
        this.isLoading = false;
      }
    }, 1000);
  }

  private validateEmailStep(): boolean {
    this.clearEmailErrors();
    
    const email = this.loginData.email.trim();
    
    if (!email) {
      return false;
    }
    
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    if (!emailPattern.test(email.toLowerCase())) {
      return false;
    }

    return true;
  }

  private validatePasswordStep(): boolean {
    this.clearPasswordErrors();
    
    const password = this.loginData.password;

    if (!password || password.length < 8) {
      return false;
    }

    return true;
  }

  private findUserByEmail(email: string): User | undefined {
    return this.users.find(user => user.email.toLowerCase() === email.toLowerCase());
  }

  private redirectByRole(roleClass: string): void {
    // Aquí implementarás la lógica de redirección según el rol
    switch (roleClass) {
      case 'paciente':
        // this.router.navigate(['/paciente/dashboard']);
        break;
      case 'medico':
        // this.router.navigate(['/medico/dashboard']);
        break;
      case 'operador':
        // this.router.navigate(['/operador/dashboard']);
        break;
      case 'admin':
        // this.router.navigate(['/admin/dashboard']);
        break;
      default:
        // this.router.navigate(['/home']);
        break;
    }
  }

  changeAccount(): void {
    this.currentStep = 'email';
    this.userAccount = null;
    this.loginData.password = '';
    this.clearAllErrors();
    
    // Enfocar el campo de email
    setTimeout(() => {
      const emailField = document.getElementById('email');
      if (emailField) {
        emailField.focus();
      }
    }, 100);
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  clearEmailErrors(): void {
    this.showEmailError = false;
  }

  clearPasswordErrors(): void {
    this.showPasswordError = false;
  }

  private clearAllErrors(): void {
    this.clearEmailErrors();
    this.clearPasswordErrors();
  }

  navigateToRegister(): void {
    // Trigger pulse animation
    this.pulseState = 'clicked';
    
    // Navigate after a short delay for the animation
      this.router.navigate(['/registro-usuario']);
      this.pulseState = 'idle';
    ;
  }

  forgotEmail(): void {
    // Implementar lógica para recuperar email
    alert('Funcionalidad de recuperar email - Por implementar');
  }

  forgotPassword(): void {
    // Implementar lógica para recuperar contraseña
    alert('Funcionalidad de recuperar contraseña - Por implementar');
  }
}
