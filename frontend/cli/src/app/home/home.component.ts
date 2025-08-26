import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PacienteService } from '../pacientes/paciente.service';
import { Paciente } from '../pacientes/paciente';
import { MedicoService } from '../medicos/medico.service';

@Component({
  selector: 'app-home',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="home-container">
      <!-- Hero Section -->
      <div class="hero-section">
        <div class="hero-content">
          <div class="brand-logo">
            <i class="fas fa-calendar-check"></i>
            <h1 class="brand-title">CheTurno</h1>
          </div>
          <p class="hero-subtitle">
            Gestión inteligente de turnos médicos para centros de atención
          </p>
        </div>
      </div>

      <!-- Login Section -->
      <div class="login-section">
        <div class="login-card">
          <h2 class="login-title">Acceso al Sistema</h2>
          
          <!-- Role Selection -->
          <div class="role-selection" *ngIf="!selectedRole">
            <h3>Selecciona tu tipo de acceso:</h3>
            <div class="role-buttons">
              <button 
                class="role-btn admin-btn" 
                (click)="selectRole('admin')"
              >
                <i class="fas fa-user-shield"></i>
                <span>Administrador</span>
                <small>Gestión completa del sistema</small>
              </button>
              <button 
                class="role-btn medico-btn" 
                (click)="selectRole('medico')"
              >
                <i class="fas fa-user-md"></i>
                <span>Médico</span>
                <small>Gestión de turnos y horarios</small>
              </button>
              <button 
                class="role-btn patient-btn" 
                (click)="selectRole('patient')"
              >
                <i class="fas fa-user"></i>
                <span>Paciente</span>
                <small>Consulta y gestión de turnos</small>
              </button>
            </div>
          </div>

          <!-- Admin Login Form -->
          <div class="login-form" *ngIf="selectedRole === 'admin'">
            <h3>Acceso Administrador</h3>
            <div class="dev-notice">
              <i class="fas fa-code"></i>
              <p>Modo desarrollo - Acceso directo habilitado</p>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-login" (click)="loginAdmin()">
                <i class="fas fa-sign-in-alt"></i>
                Ingresar como Admin
              </button>
              <button type="button" class="btn btn-back" (click)="goBack()">
                <i class="fas fa-arrow-left"></i>
                Volver
              </button>
            </div>
          </div>

          <!-- Medico Login Form -->
          <div class="login-form" *ngIf="selectedRole === 'medico'">
            <h3>Acceso Médico</h3>
            <form (ngSubmit)="loginMedico()" #medicoForm="ngForm">
              <div class="form-group">
                <label for="matricula">Matrícula:</label>
                <input 
                  type="text" 
                  id="matricula" 
                  name="matricula"
                  [(ngModel)]="medicoCredentials.matricula"
                  class="form-control"
                  required
                  placeholder="Ingresa tu número de matrícula"
                  pattern="[0-9]{5}-[0-9]{1}"
                  maxlength="7"
                >
                <small class="form-text">Formato: 12345-6</small>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-login" [disabled]="!medicoForm.valid">
                  <i class="fas fa-sign-in-alt"></i>
                  Ingresar
                </button>
                <button type="button" class="btn btn-back" (click)="goBack()">
                  <i class="fas fa-arrow-left"></i>
                  Volver
                </button>
              </div>
            </form>
          </div>

          <!-- Patient Login Form -->
          <div class="login-form" *ngIf="selectedRole === 'patient'">
            <h3>Acceso Paciente</h3>
            <form (ngSubmit)="loginPatient()" #patientForm="ngForm">
              <div class="form-group">
                <label for="dni">DNI:</label>
                <input 
                  type="text" 
                  id="dni" 
                  name="dni"
                  [(ngModel)]="patientCredentials.dni"
                  class="form-control"
                  required
                  placeholder="Ingresa tu DNI (sin puntos)"
                  pattern="[0-9]{7,8}"
                  maxlength="8"
                >
                <small class="form-text">Ingresa tu DNI sin puntos ni espacios</small>
              </div>
              <div class="form-actions">
                <button type="submit" class="btn btn-login" [disabled]="!patientForm.valid">
                  <i class="fas fa-sign-in-alt"></i>
                  Ingresar
                </button>
                <button type="button" class="btn btn-back" (click)="goBack()">
                  <i class="fas fa-arrow-left"></i>
                  Volver
                </button>
              </div>
            </form>
            
            <!-- Registration prompt -->
            <div class="registration-prompt" *ngIf="showRegistrationPrompt">
              <p>No encontramos tu DNI en el sistema.</p>
              <button class="btn btn-register" (click)="showRegistrationForm = true">
                <i class="fas fa-user-plus"></i>
                Registrarse como Paciente
              </button>
            </div>
          </div>

          <!-- Patient Registration Form -->
          <div class="login-form" *ngIf="showRegistrationForm">
            <h3>Registro de Paciente</h3>
            <form (ngSubmit)="submitRegistration()" #registrationForm="ngForm">
              <div class="form-group">
                <label for="regDni">DNI:</label>
                <input 
                  type="text" 
                  id="regDni" 
                  name="regDni"
                  [(ngModel)]="registrationData.dni"
                  class="form-control"
                  required
                  readonly
                  [value]="patientCredentials.dni"
                >
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="nombre">Nombre:</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    name="nombre"
                    [(ngModel)]="registrationData.nombre"
                    class="form-control"
                    required
                    placeholder="Tu nombre"
                  >
                </div>
                <div class="form-group">
                  <label for="apellido">Apellido:</label>
                  <input 
                    type="text" 
                    id="apellido" 
                    name="apellido"
                    [(ngModel)]="registrationData.apellido"
                    class="form-control"
                    required
                    placeholder="Tu apellido"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="email">Email:</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  [(ngModel)]="registrationData.email"
                  class="form-control"
                  required
                  placeholder="tu@email.com"
                >
              </div>

              <div class="form-group">
                <label for="telefono">Teléfono:</label>
                <input 
                  type="tel" 
                  id="telefono" 
                  name="telefono"
                  [(ngModel)]="registrationData.telefono"
                  class="form-control"
                  required
                  placeholder="Tu número de teléfono"
                >
              </div>

              <div class="form-group">
                <label for="fechaNacimiento">Fecha de Nacimiento:</label>
                <input 
                  type="date" 
                  id="fechaNacimiento" 
                  name="fechaNacimiento"
                  [(ngModel)]="registrationData.fechaNacimiento"
                  class="form-control"
                  required
                >
              </div>

              <div class="form-group">
                <label for="obraSocial">Obra Social (opcional):</label>
                <select 
                  id="obraSocial" 
                  name="obraSocial"
                  [(ngModel)]="registrationData.obraSocialId"
                  class="form-control"
                >
                  <option value="">Sin obra social</option>
                  <option *ngFor="let obra of obrasSociales" [value]="obra.id">
                    {{ obra.nombre }}
                  </option>
                </select>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-register" [disabled]="!registrationForm.valid || isRegistering">
                  <i class="fas fa-user-plus" *ngIf="!isRegistering"></i>
                  <i class="fas fa-spinner fa-spin" *ngIf="isRegistering"></i>
                  {{ isRegistering ? 'Registrando...' : 'Registrar' }}
                </button>
                <button type="button" class="btn btn-back" (click)="cancelRegistration()">
                  <i class="fas fa-arrow-left"></i>
                  Cancelar
                </button>
              </div>
            </form>
          </div>

          <!-- Error Messages -->
          <div class="error-message" *ngIf="errorMessage">
            <i class="fas fa-exclamation-triangle"></i>
            {{ errorMessage }}
          </div>

          <!-- Loading State -->
          <div class="loading" *ngIf="isLoading">
            <i class="fas fa-spinner fa-spin"></i>
            Verificando credenciales...
          </div>
        </div>
      </div>

      <!-- Features Section -->
      <div class="features-section" *ngIf="!selectedRole">
        <div class="features-grid">
          <div class="feature-card">
            <i class="fas fa-calendar-alt"></i>
            <h3>Gestión de Turnos</h3>
            <p>Programa y administra turnos de manera eficiente</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-user-md"></i>
            <h3>Control de Médicos</h3>
            <p>Administra horarios y disponibilidad del personal médico</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-chart-line"></i>
            <h3>Reportes</h3>
            <p>Visualiza estadísticas y métricas del centro</p>
          </div>
          <div class="feature-card">
            <i class="fas fa-mobile-alt"></i>
            <h3>Acceso Fácil</h3>
            <p>Interfaz intuitiva y accesible desde cualquier dispositivo</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: `
    .home-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      display: flex;
      flex-direction: column;
    }

    .hero-section {
      padding: 4rem 2rem 2rem;
      text-align: center;
      color: #333;
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .hero-content {
      max-width: 800px;
      margin: 0 auto;
    }

    .brand-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .brand-logo i {
      font-size: 3rem;
      color: white;
      background: var(--turnos-gradient);
      padding: 1rem;
      border-radius: 50%;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .brand-title {
      font-size: 3.5rem;
      font-weight: 700;
      margin: 0;
      color: #2c3e50 !important;
      text-shadow: none;
    }

    .hero-subtitle {
      font-size: 1.3rem;
      margin: 0;
      font-weight: 300;
      color: #6c757d !important;
    }

    .login-section {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }

    .login-card {
      background: white;
      border-radius: 20px;
      padding: 2.5rem;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 500px;
      position: relative;
    }

    .login-title {
      text-align: center;
      margin-bottom: 2rem;
      color: #333;
      font-weight: 600;
    }

    .role-selection h3 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #555;
      font-weight: 500;
    }

    .role-buttons {
      display: grid;
      gap: 1rem;
    }

    .role-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 1.5rem;
      border: 2px solid transparent;
      border-radius: 15px;
      background: white;
      cursor: pointer;
      transition: all 0.3s ease;
      text-decoration: none;
      color: #333;
    }

    .role-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }

    .admin-btn {
      background: var(--centro-atencion-gradient);
      color: white;
    }

    .admin-btn:hover {
      box-shadow: 0 8px 25px var(--centro-atencion-shadow);
    }

    .medico-btn {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }

    .medico-btn:hover {
      box-shadow: 0 8px 25px rgba(40, 167, 69, 0.3);
    }

    .patient-btn {
      background: var(--pacientes-gradient);
      color: white;
    }

    .patient-btn:hover {
      box-shadow: 0 8px 25px var(--pacientes-shadow);
    }

    .role-btn i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .role-btn span {
      font-size: 1.2rem;
      font-weight: 600;
      margin-bottom: 0.3rem;
    }

    .role-btn small {
      font-size: 0.9rem;
      opacity: 0.8;
      text-align: center;
    }

    .login-form {
      animation: fadeIn 0.3s ease-in;
    }

    .login-form h3 {
      text-align: center;
      margin-bottom: 1.5rem;
      color: #333;
      font-weight: 500;
    }

    .dev-notice {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
      border: 1px solid #2196f3;
      border-radius: 10px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      text-align: center;
      color: #1976d2;
    }

    .dev-notice i {
      font-size: 1.2rem;
      margin-right: 0.5rem;
    }

    .dev-notice p {
      margin: 0;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #555;
      font-weight: 500;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e1e5e9;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--turnos-primary);
      box-shadow: 0 0 0 3px var(--turnos-shadow);
    }

    .form-text {
      color: #6c757d;
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      justify-content: center;
      flex: 1;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-login {
      background: var(--turnos-gradient);
      color: white;
    }

    .btn-login:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px var(--turnos-shadow);
    }

    .btn-back {
      background: #f8f9fa;
      color: #6c757d;
      border: 2px solid #e9ecef;
    }

    .btn-back:hover {
      background: #e9ecef;
      color: #495057;
    }

    .btn-register {
      background: var(--action-add);
      color: white;
      width: 100%;
      margin-top: 1rem;
    }

    .btn-register:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 15px var(--action-add-shadow);
    }

    .registration-prompt {
      text-align: center;
      margin-top: 1.5rem;
      padding: 1rem;
      background: #f8f9fa;
      border-radius: 10px;
      border-left: 4px solid var(--pacientes-primary);
    }

    .registration-prompt p {
      margin-bottom: 1rem;
      color: #6c757d;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    input[readonly] {
      background-color: #f8f9fa;
      color: #6c757d;
    }

    .error-message {
      background: #fee;
      color: #dc3545;
      padding: 1rem;
      border-radius: 10px;
      border-left: 4px solid #dc3545;
      margin-top: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .loading {
      text-align: center;
      padding: 1rem;
      color: #6c757d;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .features-section {
      padding: 3rem 2rem;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .feature-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: transform 0.3s ease;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-card i {
      font-size: 2.5rem;
      color: var(--turnos-primary);
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      margin-bottom: 1rem;
      color: #333;
      font-weight: 600;
    }

    .feature-card p {
      color: #6c757d;
      line-height: 1.6;
      margin: 0;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Responsive Design */
    @media (max-width: 768px) {
      .brand-title {
        font-size: 2.5rem;
      }
      
      .hero-subtitle {
        font-size: 1.1rem;
      }
      
      .login-card {
        margin: 1rem;
        padding: 2rem;
      }
      
      .form-actions {
        flex-direction: column;
      }

      .form-row {
        grid-template-columns: 1fr;
      }
      
      .features-grid {
        grid-template-columns: 1fr;
      }
    }
  `
})
export class HomeComponent {
  selectedRole: 'admin' | 'medico' | 'patient' | null = null;
  isLoading = false;
  isRegistering = false;
  errorMessage = '';
  showRegistrationPrompt = false;
  showRegistrationForm = false;
  obrasSociales: any[] = [];

  adminCredentials = {
    username: '',
    password: ''
  };

  medicoCredentials = {
    matricula: ''
  };

  patientCredentials = {
    dni: ''
  };

  registrationData = {
    dni: '',
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    fechaNacimiento: '',
    obraSocialId: ''
  };

  constructor(private router: Router, private pacienteService: PacienteService, private medicoService: MedicoService) {
    this.loadObrasSociales();
  }

  selectRole(role: 'admin' | 'medico' | 'patient') {
    this.selectedRole = role;
    this.errorMessage = '';
    this.showRegistrationPrompt = false;
  }

  goBack() {
    this.selectedRole = null;
    this.errorMessage = '';
    this.showRegistrationPrompt = false;
    this.showRegistrationForm = false;
    this.adminCredentials = { username: '', password: '' };
    this.medicoCredentials = { matricula: '' };
    this.patientCredentials = { dni: '' };
    this.resetRegistrationData();
  }

  async loginAdmin() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      // Simular breve delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 800));

      // Acceso directo para desarrollo
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('userName', 'Administrador');
      this.router.navigate(['/turnos']);
    } catch (error) {
      this.errorMessage = 'Error al acceder al sistema';
    } finally {
      this.isLoading = false;
    }
  }

  async loginMedico() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      const matricula = this.medicoCredentials.matricula;
      
      // Validar formato de matrícula
      const matriculaRegex = /^[0-9]{5}-[0-9]$/;
      if (!matriculaRegex.test(matricula)) {
        this.errorMessage = 'Por favor ingresa una matrícula válida (formato: 12345-6)';
        this.isLoading = false;
        return;
      }

      // Buscar médico por matrícula usando API
      this.medicoService.findByMatricula(matricula).subscribe({
        next: (response) => {
          if (response && response.data) {
            const medicoData = response.data;
            
            // Guardar datos del médico en localStorage
            localStorage.setItem('userRole', 'medico');
            localStorage.setItem('medicoMatricula', matricula);
            localStorage.setItem('medicoData', JSON.stringify(medicoData));
            localStorage.setItem('medicoId', medicoData.id.toString());
            localStorage.setItem('userName', `${medicoData.nombre} ${medicoData.apellido}`);
            
            this.isLoading = false;
            this.router.navigate(['/medico-dashboard']);
          } else {
            this.errorMessage = 'Matrícula no encontrada en el sistema';
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error al validar matrícula:', error);
          this.errorMessage = 'Matrícula no encontrada o error del servidor';
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.errorMessage = 'Error al acceder al sistema médico';
      this.isLoading = false;
    }
  }

  async loginPatient() {
    this.isLoading = true;
    this.errorMessage = '';
    this.showRegistrationPrompt = false;

    try {
      const dni = parseInt(this.patientCredentials.dni);
      
      // Validar que el DNI sea un número válido
      if (isNaN(dni) || dni <= 0) {
        this.errorMessage = 'Por favor ingresa un DNI válido';
        this.isLoading = false;
        return;
      }

      // Buscar paciente por DNI en el backend
      this.pacienteService.findByDni(dni).subscribe({
        next: (response: any) => {
          console.log('Respuesta del servidor:', response);
          
          // Verificar si la respuesta tiene los datos del paciente
          // El backend envía status_code, no status
          if (response && response.data && response.status_code === 200) {
            // Paciente encontrado, iniciar sesión
            localStorage.setItem('userRole', 'patient');
            localStorage.setItem('patientDNI', this.patientCredentials.dni);
            localStorage.setItem('patientData', JSON.stringify(response.data));
            localStorage.setItem('pacienteId', response.data.id.toString()); // ← Agregar esta línea
            localStorage.setItem('userName', `${response.data.nombre} ${response.data.apellido}`);
            
            this.isLoading = false;
            this.router.navigate(['/paciente-dashboard']);
          } else {
            // No se encontró el paciente
            this.showRegistrationPrompt = true;
            this.isLoading = false;
          }
        },
        error: (error) => {
          console.error('Error al buscar paciente:', error);
          if (error.status === 404) {
            // Paciente no encontrado
            this.showRegistrationPrompt = true;
          } else {
            this.errorMessage = 'Error al conectar con el servidor. Intenta nuevamente.';
          }
          this.isLoading = false;
        }
      });
    } catch (error) {
      this.errorMessage = 'Error inesperado. Por favor intenta nuevamente.';
      this.isLoading = false;
    }
  }

  registerPatient() {
    this.showRegistrationForm = true;
    this.showRegistrationPrompt = false;
    this.registrationData.dni = this.patientCredentials.dni;
  }

  loadObrasSociales() {
    this.pacienteService.getObrasSociales().subscribe({
      next: (response) => {
        if (response && response.data) {
          this.obrasSociales = response.data;
        }
      },
      error: (error) => {
        console.error('Error al cargar obras sociales:', error);
        this.obrasSociales = [];
      }
    });
  }

  async submitRegistration() {
    this.isRegistering = true;
    this.errorMessage = '';

    try {
      // Preparar datos del paciente
      const nuevoPaciente: Partial<Paciente> = {
        nombre: this.registrationData.nombre,
        apellido: this.registrationData.apellido,
        email: this.registrationData.email,
        telefono: this.registrationData.telefono,
        dni: parseInt(this.registrationData.dni),
        fechaNacimiento: this.registrationData.fechaNacimiento
      };

      // Agregar obra social si se seleccionó
      if (this.registrationData.obraSocialId) {
        const obraSocial = this.obrasSociales.find(o => o.id == this.registrationData.obraSocialId);
        if (obraSocial) {
          nuevoPaciente.obraSocial = obraSocial;
        }
      }

      // Crear paciente
      this.pacienteService.create(nuevoPaciente as Paciente).subscribe({
        next: (response) => {
          if (response && response.data) {
            // Registro exitoso - iniciar sesión automáticamente
            localStorage.setItem('userRole', 'patient');
            localStorage.setItem('patientDNI', this.registrationData.dni);
            localStorage.setItem('patientData', JSON.stringify(response.data));
            localStorage.setItem('pacienteId', response.data.id.toString());
            localStorage.setItem('userName', `${response.data.nombre} ${response.data.apellido}`);
            
            this.isRegistering = false;
            this.router.navigate(['/paciente-dashboard']);
          } else {
            throw new Error('No se recibieron datos del paciente creado');
          }
        },
        error: (error) => {
          console.error('Error al registrar paciente:', error);
          this.errorMessage = 'Error al registrar el paciente. Verifica que todos los datos sean correctos.';
          this.isRegistering = false;
        }
      });
    } catch (error) {
      this.errorMessage = 'Error inesperado durante el registro. Por favor intenta nuevamente.';
      this.isRegistering = false;
    }
  }

  cancelRegistration() {
    this.showRegistrationForm = false;
    this.showRegistrationPrompt = true;
    this.resetRegistrationData();
    this.errorMessage = '';
  }

  resetRegistrationData() {
    this.registrationData = {
      dni: '',
      nombre: '',
      apellido: '',
      email: '',
      telefono: '',
      fechaNacimiento: '',
      obraSocialId: ''
    };
  }
}
