import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
import { Router } from "@angular/router";
import {
  fadeInAnimation,
  slideUpAnimation,
  pulseAnimation,
  logoAnimation,
} from "../animations";
import { AuthService, LoginData } from "./auth.service";

interface User {
  email: string;
  password: string;
  name: string;
  role: string;
  roleClass: string;
}

@Component({
  selector: "app-inicio-sesion",
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: "./inicio-sesion.component.html",
  styleUrl: "./inicio-sesion.component.css",
  animations: [
    fadeInAnimation,
    slideUpAnimation,
    pulseAnimation,
    logoAnimation,
  ],
})
export class InicioSesionComponent {
  currentStep: "email" | "password" = "email";
  isLoading = false;
  showPassword = false;
  showEmailError = false;
  showPasswordError = false;
  errorMessage = ""; // Mensaje específico de error
  userAccount: User | null = null;
  pulseState = "idle";

  loginData: LoginData = {
    email: "",
    password: "",
    rememberMe: false,
  };


  constructor(private router: Router, private authService: AuthService) {
    // Verificar si el usuario ya está autenticado
    if (this.authService.isAuthenticated()) {
      this.authService.redirectByRole();
      return;
    }

  }

  handleSubmit(form: NgForm): void {
    if (this.currentStep === "email") {
      this.handleEmailSubmit();
    } else if (this.currentStep === "password") {
      this.handlePasswordSubmit();
    }
  }

  private handleEmailSubmit(): void {
    if (!this.validateEmailStep()) {
      return;
    }

    this.isLoading = true;

    // Verificar email en la base de datos
    this.authService.checkEmail(this.loginData.email).subscribe({
      next: (response) => {
        if (response.status_code === 200 && response.data) {
          // Email encontrado, crear objeto de usuario con la información
          this.userAccount = {
            email: response.data.email,
            password: '', // No necesitamos la contraseña aquí
            name: response.data.nombre,
            role: response.data.role,
            roleClass: this.getRoleClass(response.data.role)
          };
          
          this.currentStep = 'password';
          this.isLoading = false;
          
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
      },
      error: (error) => {
        console.error('Error verificando email:', error);
        // Si hay error o email no encontrado, mostrar mensaje de error
        this.showEmailError = true;
        this.isLoading = false;
      }
    });
  }

  private handlePasswordSubmit(): void {
    if (!this.validatePasswordStep()) {
      return;
    }

    this.isLoading = true;

    // Usar el AuthService para hacer login real
    this.authService.login(this.loginData).subscribe({
      next: (response) => {
        if (response.status_code === 200) {
          console.log(`Login exitoso:`);

          // Guardar userRole en localStorage para compatibilidad con guards existentes
          const role = this.authService.getUserRole();
          if (role) {
            const roleRoute = this.authService.mapRoleToRoute(role);
            localStorage.setItem("userRole", roleRoute);
          }

          // Redirigir según el rol del usuario
          this.authService.redirectByRole();

          this.isLoading = false;
        } else {
          // Manejar errores cuando status_code !== 200
          console.error("Error en login:", response.status_text || response.message);
          this.errorMessage = response.status_text || response.message || "Error al iniciar sesión";
          this.showPasswordError = true;
          this.isLoading = false;
        }
      },
      error: (error) => {
        console.error("Error en login:", error);
        this.errorMessage = error.message || "Error al iniciar sesión";
        this.showPasswordError = true;
        this.isLoading = false;
      },
    });
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

  /**
   * Mapea el rol del backend a la clase CSS correspondiente
   * @param role Rol del backend
   * @returns Clase CSS para el rol
   */
  private getRoleClass(role: string): string {
    const roleMapping: { [key: string]: string } = {
      'PACIENTE': 'paciente',
      'MEDICO': 'medico',
      'OPERARIO': 'operador',
      'ADMINISTRADOR': 'admin'
    };
    return roleMapping[role] || 'paciente';
  }


  changeAccount(): void {
    this.currentStep = "email";
    this.userAccount = null;
    this.loginData.password = "";
    this.clearAllErrors();

    // Enfocar el campo de email
    setTimeout(() => {
      const emailField = document.getElementById("email");
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
    this.errorMessage = "";
  }

  private clearAllErrors(): void {
    this.clearEmailErrors();
    this.clearPasswordErrors();
  }

  navigateToRegister(): void {
    // Trigger pulse animation
    this.pulseState = "clicked";

    // Navigate after a short delay for the animation
    this.router.navigate(["/registro-usuario"]);
    this.pulseState = "idle";
  }

  forgotEmail(): void {
    // Implementar lógica para recuperar email
    alert("Funcionalidad de recuperar email - Por implementar");
  }

  forgotPassword(): void {
    // Implementar lógica para recuperar contraseña
    alert("Funcionalidad de recuperar contraseña - Por implementar");
  }

  /**
   * Método de logout para uso futuro
   */
  logout(): void {
    this.authService.logout();
  }
}
