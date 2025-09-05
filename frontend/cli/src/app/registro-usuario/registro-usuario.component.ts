import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { fadeInAnimation, slideUpAnimation, pulseAnimation, logoAnimation } from '../animations';
import { RegistroService, PacienteRegistroDTO } from './registro.service';
import { DataPackage } from '../data.package';

// objeto usado en el formulario frontend
interface UsuarioFormulario {
  nombre: string;
  apellido: string;
  dni: string;
  codigoPais: string;
  telefono: string;
  email: string;
  password: string;
  confirmPassword: string;
}


@Component({
  selector: 'app-registro-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-usuario.component.html',
  styleUrl: './registro-usuario.component.css',
  animations: [fadeInAnimation, slideUpAnimation, pulseAnimation, logoAnimation]
})
export class RegistroUsuarioComponent {
  
  usuario: UsuarioFormulario = {
    nombre: '',
    apellido: '',
    dni: '',
    codigoPais: '+54', // Valor por defecto Argentina
    telefono: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  pulseState = 'idle';
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private router: Router,
    private registroService: RegistroService
  ) {}

  /**
   * Valida si las contraseñas coinciden
   */
  passwordsMatch(): boolean {
    return this.usuario.password === this.usuario.confirmPassword;
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(form: NgForm): void {
    if (form.valid && this.passwordsMatch()) {
      this.isLoading = true;
      this.errorMessage = '';
      this.successMessage = '';

      // Construir el número de teléfono completo
      const telefonoCompleto = `${this.usuario.codigoPais} ${this.usuario.telefono}`;
      
      // Crear objeto de datos para enviar al backend
      const datosRegistro: PacienteRegistroDTO = {
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        dni: this.usuario.dni,
        telefono: telefonoCompleto,
        email: this.usuario.email,
        password: this.usuario.password
      };

      console.log('Enviando datos al backend:', datosRegistro);
      
      // Llamada al servicio de registro
      this.registrarUsuario(datosRegistro);
    } else {
      console.log('Formulario inválido');
      this.marcarCamposComoTocados(form);
    }
  }

  /**
   * Registra el usuario utilizando el servicio HTTP
   */
  private registrarUsuario(datos: PacienteRegistroDTO): void {
    this.registroService.registrarPaciente(datos).subscribe({
      next: (response: DataPackage) => {
        this.isLoading = false;
        console.log('Respuesta del servidor:', response);
        
        
        if (response.status_code === 200) {
          console.log('Usuario registrado exitosamente:', response.data);
        } else {
          this.errorMessage = response.status_text;
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Error al registrar usuario:', error);
        
        // Manejar diferentes tipos de errores HTTP con mensajes profesionales
        if (error.status === 409) {
          this.errorMessage = 'Este email o DNI ya está registrado en nuestro sistema. Por favor, verifica tus datos o intenta iniciar sesión.';
        } else if (error.status === 400) {
          this.errorMessage = error.error?.status_text || error.error?.message || 'Los datos ingresados no son válidos. Por favor, revisa la información y vuelve a intentarlo.';
        } else if (error.status === 500) {
          this.errorMessage = 'Estamos experimentando problemas técnicos temporales. Por favor, intenta nuevamente en unos minutos.';
        } else if (error.status === 0) {
          this.errorMessage = 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.';
        } else if (error.status === 422) {
          this.errorMessage = 'Algunos campos contienen información incorrecta. Por favor, revisa los datos e intenta nuevamente.';
        } else if (error.status === 503) {
          this.errorMessage = 'El servicio no está disponible temporalmente. Por favor, intenta más tarde.';
        } else {
          this.errorMessage = error.error?.status_text || error.error?.message || 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente o contacta al soporte técnico.';
        }
      }
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar errores de validación
   */
  private marcarCamposComoTocados(form: NgForm): void {
    Object.keys(form.controls).forEach(field => {
      const control = form.controls[field];
      control.markAsTouched({ onlySelf: true });
    });
  }

  // Función para permitir solo números en el campo de dni y teléfono
  onlyNumbers(event: KeyboardEvent) {
  const charCode = event.charCode;
  if (charCode < 48 || charCode > 57) {
    event.preventDefault(); // bloquea letras y símbolos
  }
}

  // Función para permitir solo letras y espacios en los campos de nombre y apellido
onlyText(event: KeyboardEvent) {
  const char = String.fromCharCode(event.charCode);

  // Regex: solo letras (mayúsculas/minúsculas, acentos, ñ, Ñ) y espacios
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;

  if (!regex.test(char)) {
    event.preventDefault(); // bloquea caracteres no permitidos
  }
}

// Función para validar el contenido pegado en campos de texto (nombre, apellido)
validateTextPaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text') || '';
  
  // Regex: solo letras (mayúsculas/minúsculas, acentos, ñ, Ñ) y espacios
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
  
  if (!regex.test(pastedText)) {
    event.preventDefault();
    this.errorMessage = 'Solo se permiten letras y espacios en este campo.';
  }
}

// Función para validar el contenido pegado en campos numéricos (DNI, teléfono)
validateNumberPaste(event: ClipboardEvent) {
  const pastedText = event.clipboardData?.getData('text') || '';
  
  // Regex: solo números
  const regex = /^[0-9]+$/;
  
  if (!regex.test(pastedText)) {
    event.preventDefault();
    this.errorMessage = 'Solo se permiten números en este campo.';
  }
}





  /**
   * Limpia los mensajes de error y éxito
   */
  limpiarMensajes(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  /**
   * Navega a la página de login
   */
  navigateToLogin(): void {
    // Trigger pulse animation
    this.pulseState = 'clicked';
    
      this.router.navigate(['/']);
      this.pulseState = 'idle';
  }

  /**
   * Valida el DNI en tiempo real
   */
  validarDNI(): boolean {
    const dniPattern = /^[0-9]{7,12}$/;
    return dniPattern.test(this.usuario.dni);
  }

  /**
   * Valida el email en tiempo real
   */
  validarEmail(): boolean {
    const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailPattern.test(this.usuario.email.toLowerCase());
  }

  /**
   * Valida el teléfono en tiempo real
   */
  validarTelefono(): boolean {
    const phonePattern = /^[0-9]{6,12}$/;
    return phonePattern.test(this.usuario.telefono);
  }

  /**
   * Valida la contraseña (mínimo 8 caracteres)
   */
  validarPassword(): boolean {
    return this.usuario.password.length >= 8;
  }
}
