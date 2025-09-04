import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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

// objeto esperado por el backend
interface UsuarioRegistro {
  nombre: string;
  apellido: string;
  dni: string;
  telefono: string;  // Incluye código país
  email: string;
  password: string;
}

@Component({
  selector: 'app-registro-usuario',
  imports: [CommonModule, FormsModule],
  templateUrl: './registro-usuario.component.html',
  styleUrl: './registro-usuario.component.css'
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

  constructor(private router: Router) {}

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
      // Construir el número de teléfono completo
      const telefonoCompleto = `${this.usuario.codigoPais} ${this.usuario.telefono}`;
      
      // Crear objeto de datos para enviar
      const datosRegistro = {
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        dni: this.usuario.dni,
        telefono: telefonoCompleto,
        email: this.usuario.email,
        password: this.usuario.password
      };

      console.log('Datos del registro:', datosRegistro);
      
      // Aquí se realizaría la llamada al servicio de registro
      this.registrarUsuario(datosRegistro);
    } else {
      console.log('Formulario inválido');
      this.marcarCamposComoTocados(form);
    }
  }

  /**
   * Simula el registro del usuario
   * En un caso real, esto sería una llamada a un servicio HTTP
   */
  private registrarUsuario(datos: any): void {
    // Simulación de llamada HTTP
    console.log('Registrando usuario...', datos);
    
    // Mostrar mensaje de éxito
    alert(`¡Registro exitoso! Bienvenido ${datos.nombre} ${datos.apellido}. Teléfono: ${datos.telefono}`);
    
    // Aquí podrías redirigir al usuario o limpiar el formulario
    this.limpiarFormulario();
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

  /**
   * Limpia el formulario después del registro exitoso
   */
  private limpiarFormulario(): void {
    this.usuario = {
      nombre: '',
      apellido: '',
      dni: '',
      codigoPais: '+54',
      telefono: '',
      email: '',
      password: '',
      confirmPassword: ''
    };
  }

  /**
   * Navega a la página de login
   */
  navigateToLogin(): void {
    // Aquí puedes navegar a la ruta de login
    console.log('Navegando a login...');
    // this.router.navigate(['/login']);
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
