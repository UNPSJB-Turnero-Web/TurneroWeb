import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgbDropdownModule, CommonModule],
  template: `
    <nav class="modern-navbar">
      <div class="navbar-container">
        <!-- LOGO Y BRAND -->
        <div class="brand-section">
          <a href="/" class="brand-link">
            <div class="brand-icon">
              <i class="fas fa-calendar-check"></i>
            </div>
            <div class="brand-text">
              <h5 class="brand-title">CheTurno</h5>
              <span class="brand-subtitle">Sistema de Turnos</span>
            </div>
          </a>
        </div>

        <!-- NAVIGATION MENU -->
        <div class="nav-menu" *ngIf="isAuthenticated()">
          <!-- Admin-only Menú General -->
          <div ngbDropdown class="nav-dropdown" *ngIf="isAdmin()">
            <button 
              class="nav-button"
              [class.active]="isRouteActive('/centrosAtencion') || isRouteActive('/consultorios')"
              ngbDropdownToggle
              id="generalDropdown"
              aria-label="Menú de configuración general"
            >
              <i class="fas fa-building me-2"></i>
              <span>General</span>
              <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <div ngbDropdownMenu class="modern-dropdown" aria-labelledby="generalDropdown">
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/centrosAtencion')" [class.active]="isRouteActive('/centrosAtencion')">
                <i class="fas fa-hospital icon-item icon-centro-atencion"></i>
                <div class="item-content">
                  <span class="item-title">Centros de Atención</span>
                  <span class="item-desc">Gestionar centros médicos</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/consultorios')" [class.active]="isRouteActive('/consultorios')">
                <i class="fas fa-door-open icon-item icon-consultorios"></i>
                <div class="item-content">
                  <span class="item-title">Consultorios</span>
                  <span class="item-desc">Administrar consultorios</span>
                </div>
              </a>
            </div>
          </div>

          <!-- Admin-only Menú Persona -->
          <div ngbDropdown class="nav-dropdown" *ngIf="isAdmin()">
            <button 
              class="nav-button"
              [class.active]="isRouteActive('/medicos') || isRouteActive('/staffMedico') || isRouteActive('/pacientes') || isRouteActive('/obraSocial')"
              ngbDropdownToggle
              id="personasDropdown"
              aria-label="Menú de gestión de personas"
            >
              <i class="fas fa-users me-2"></i>
              <span>Personas</span>
              <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <div ngbDropdownMenu class="modern-dropdown" aria-labelledby="personasDropdown">
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/medicos')" [class.active]="isRouteActive('/medicos')">
                <i class="fas fa-user-md icon-item icon-medicos"></i>
                <div class="item-content">
                  <span class="item-title">Médicos</span>
                  <span class="item-desc">Gestionar profesionales</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/staffMedico')" [class.active]="isRouteActive('/staffMedico')">
                <i class="fas fa-user-nurse icon-item icon-staff-medico"></i>
                <div class="item-content">
                  <span class="item-title">Staff Médico</span>
                  <span class="item-desc">Personal médico</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/pacientes')" [class.active]="isRouteActive('/pacientes')">
                <i class="fas fa-user-injured icon-item icon-pacientes"></i>
                <div class="item-content">
                  <span class="item-title">Pacientes</span>
                  <span class="item-desc">Registro de pacientes</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/obraSocial')" [class.active]="isRouteActive('/obraSocial')">
                <i class="fas fa-heart-pulse icon-item icon-obra-social"></i>
                <div class="item-content">
                  <span class="item-title">Obras Sociales</span>
                  <span class="item-desc">Coberturas médicas</span>
                </div>
              </a>
            </div>
          </div>

          <!-- Admin-only Menú Agenda -->
          <div ngbDropdown class="nav-dropdown" *ngIf="isAdmin()">
            <button 
              class="nav-button"
              [class.active]="isRouteActive('/disponibilidades-medico') || isRouteActive('/esquema-turno') || isRouteActive('/agenda') || isRouteActive('/turnos')"
              ngbDropdownToggle
              id="agendaDropdown"
              aria-label="Menú de gestión de agenda y turnos"
            >
              <i class="fas fa-calendar-alt me-2"></i>
              <span>Agenda</span>
              <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <div ngbDropdownMenu class="modern-dropdown" aria-labelledby="agendaDropdown">
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/disponibilidades-medico')" [class.active]="isRouteActive('/disponibilidades-medico')">
                <i class="fas fa-clock icon-item icon-disponibilidad"></i>
                <div class="item-content">
                  <span class="item-title">Disponibilidades</span>
                  <span class="item-desc">Horarios médicos</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/esquema-turno')" [class.active]="isRouteActive('/esquema-turno')">
                <i class="fas fa-calendar-check icon-item icon-esquema-turno"></i>
                <div class="item-content">
                  <span class="item-title">Esquemas de Turno</span>
                  <span class="item-desc">Plantillas de turnos</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/agenda')" [class.active]="isRouteActive('/agenda')">
                <i class="fas fa-calendar-week icon-item icon-agenda"></i>
                <div class="item-content">
                  <span class="item-title">Agenda</span>
                  <span class="item-desc">Vista de agenda</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/agenda/dias-excepcionales')" [class.active]="isRouteActive('/agenda/dias-excepcionales')">
                <i class="fas fa-calendar-times icon-item icon-dias-excepcionales"></i>
                <div class="item-content">
                  <span class="item-title">Días Excepcionales</span>
                  <span class="item-desc">Feriados y mantenimiento</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/turnos')" [class.active]="isRouteActive('/turnos')">
                <i class="fas fa-clipboard-list icon-item icon-turnos"></i>
                <div class="item-content">
                  <span class="item-title">Turnos</span>
                  <span class="item-desc">Gestión de citas</span>
                </div>
              </a>
            </div>
          </div>

          <!-- Patient-only Menú -->
          <div ngbDropdown class="nav-dropdown" *ngIf="isPatient()">
            <button 
              class="nav-button"
              [class.active]="isRouteActive('/paciente-dashboard') || isRouteActive('/paciente-turnos') || isRouteActive('/paciente-agenda')"
              ngbDropdownToggle
              id="pacienteDropdown"
              aria-label="Portal del paciente"
            >
              <i class="fas fa-user-injured me-2"></i>
              <span>Mi Portal</span>
              <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <div ngbDropdownMenu class="modern-dropdown" aria-labelledby="pacienteDropdown">
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/paciente-dashboard')" [class.active]="isRouteActive('/paciente-dashboard')">
                <i class="fas fa-tachometer-alt icon-item icon-dashboard"></i>
                <div class="item-content">
                  <span class="item-title">Dashboard</span>
                  <span class="item-desc">Panel principal</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/paciente-turnos')" [class.active]="isRouteActive('/paciente-turnos')">
                <i class="fas fa-calendar-check icon-item icon-mis-turnos"></i>
                <div class="item-content">
                  <span class="item-title">Mis Turnos</span>
                  <span class="item-desc">Ver y gestionar turnos</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="navigateTo('/paciente-agenda')" [class.active]="isRouteActive('/paciente-agenda')">
                <i class="fas fa-calendar-plus icon-item icon-agendar"></i>
                <div class="item-content">
                  <span class="item-title">Agendar Turno</span>
                  <span class="item-desc">Solicitar nueva cita</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- USER SECTION -->
        <div class="user-section">
          <!-- Login Button (for non-authenticated users) -->
          <button class="login-button" *ngIf="!isAuthenticated()" (click)="goToLogin()">
            <i class="fas fa-sign-in-alt me-2"></i>
            <span>Iniciar Sesión</span>
          </button>

          <!-- User Menu (for authenticated users) -->
          <div ngbDropdown class="nav-dropdown" *ngIf="isAuthenticated()">
            <button class="user-button" ngbDropdownToggle id="userDropdown">
              <div class="user-avatar">
                <i class="fas fa-user"></i>
              </div>
              <div class="user-info">
                <span class="user-name">{{getUserName()}}</span>
                <span class="user-role">{{getUserRoleDisplay()}}</span>
              </div>
            </button>
            <div ngbDropdownMenu class="modern-dropdown user-dropdown" aria-labelledby="userDropdown">
              <a ngbDropdownItem class="dropdown-item" href="#">
                <i class="fas fa-cog icon-item icon-configuracion"></i>
                <div class="item-content">
                  <span class="item-title">Configuración</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" (click)="logout()">
                <i class="fas fa-sign-out-alt icon-item icon-logout"></i>
                <div class="item-content">
                  <span class="item-title">Cerrar Sesión</span>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-outlet></router-outlet>
    </main>
  `,
  styles: [`
    /* NAVBAR MODERNA */
    .modern-navbar {
      background: var(--obra-social-gradient);
      backdrop-filter: blur(100px);
      -webkit-backdrop-filter: blur(100px);
      border-bottom: 1px solid rgba(255,255,255,0.1);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: 0 8px 32px var(--obra-social-shadow);
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 80px;
    }

    /* BRAND SECTION */
    .brand-section {
      display: flex;
      align-items: center;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 1rem;
      text-decoration: none;
      color: white;
      transition: all 0.3s ease;
    }

    .brand-link:hover {
      color: white;
      transform: translateY(-2px);
    }

    .brand-icon {
      width: 50px;
      height: 50px;
      background: rgba(255,255,255,0.2);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.3);
    }

    .brand-text {
      display: flex;
      flex-direction: column;
    }

    .brand-title {
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      color: white;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    .brand-subtitle {
      font-size: 0.85rem;
      color: rgba(255,255,255,0.8);
      font-weight: 500;
    }

    /* NAVIGATION MENU */
    .nav-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .nav-dropdown {
      position: relative;
    }

    .nav-button {
      background: rgba(255,255,255,0.1) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      color: white !important;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      cursor: pointer;
      text-decoration: none;
    }

    .nav-button:hover {
      background: rgba(255,255,255,0.2) !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      color: white !important;
      border-color: rgba(255,255,255,0.3) !important;
    }

    .nav-button:focus {
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.3) !important;
    }

    .nav-button.active {
      background: rgba(255,255,255,0.25) !important;
      border-color: rgba(255,255,255,0.4) !important;
      box-shadow: 0 4px 15px rgba(0,0,0,0.15);
    }

    /* DROPDOWN MODERNO */
    .modern-dropdown {
      background: rgba(255,255,255,0.95) !important;
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2) !important;
      border-radius: 15px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15) !important;
      padding: 1rem 0;
      min-width: 280px;
      margin-top: 0.5rem;
    }

    .dropdown-item {
      display: flex !important;
      align-items: center;
      gap: 1rem;
      padding: 1rem 1.5rem !important;
      color: #495057 !important;
      text-decoration: none;
      transition: all 0.3s ease;
      border: none;
      background: transparent !important;
      cursor: pointer;
    }

    .dropdown-item:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
      color: #495057 !important;
      transform: translateX(5px);
    }

    .dropdown-item.active {
      background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%) !important;
      color: #1976d2 !important;
      border-left: 4px solid #2196f3;
    }

    .dropdown-item.active .icon-item {
      transform: scale(1.1);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .icon-item {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      font-size: 1.1rem;
      flex-shrink: 0;
      transition: all 0.3s ease;
      color: white;
    }

    .item-content {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .item-title {
      font-weight: 600;
      font-size: 1rem;
      color: #343a40;
      margin-bottom: 0.25rem;
    }

    .item-desc {
      font-size: 0.85rem;
      color: #6c757d;
    }

    /* USER SECTION STYLES */
    .user-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .login-button {
      background: rgba(255,255,255,0.1) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      color: white !important;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 500;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      cursor: pointer;
      text-decoration: none;
    }

    .login-button:hover {
      background: rgba(255,255,255,0.2) !important;
      border-color: rgba(255,255,255,0.3) !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      color: white !important;
    }

    .login-button:focus {
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.3) !important;
    }

    .user-button {
      background: rgba(255,255,255,0.1) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      color: white !important;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      min-width: 200px;
      cursor: pointer;
      text-decoration: none;
    }

    .user-button:hover {
      background: rgba(255,255,255,0.2) !important;
      border-color: rgba(255,255,255,0.3) !important;
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      color: white !important;
    }

    .user-button:focus {
      outline: none !important;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.3) !important;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      flex-grow: 1;
    }

    .user-name {
      font-weight: 600;
      font-size: 0.9rem;
      color: white;
      line-height: 1.2;
    }

    .user-role {
      font-size: 0.75rem;
      color: rgba(255,255,255,0.7);
      line-height: 1.2;
    }

    .user-dropdown {
      right: 0;
      left: auto;
      min-width: 200px;
    }

    /* MAIN CONTENT */
    .main-content {
      margin-top: 80px;
      padding: 2rem;
      min-height: calc(100vh - 80px);
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }

    /* ICON COLORS */
    .icon-centro-atencion { background: var(--centro-atencion-color); }
    .icon-consultorios { background: var(--consultorios-color); }
    .icon-medicos { background: var(--medicos-color); }
    .icon-staff-medico { background: var(--staff-medico-color); }
    .icon-pacientes { background: var(--pacientes-color); }
    .icon-obra-social { background: var(--obra-social-color); }
    .icon-disponibilidad { background: var(--disponibilidad-color); }
    .icon-esquema-turno { background: var(--esquema-turno-color); }
    .icon-agenda { background: var(--agenda-color); }
    .icon-dias-excepcionales { background: var(--dias-excepcionales-color); }
    .icon-turnos { background: var(--turnos-color); }
    .icon-dashboard { background: var(--dashboard-color); }
    .icon-mis-turnos { background: var(--mis-turnos-color); }
    .icon-agendar { background: var(--agendar-color); }
    .icon-configuracion { background: var(--configuracion-color); }
    .icon-logout { background: var(--logout-color); }

    /* RESPONSIVE */
    @media (max-width: 992px) {
      .navbar-container {
        padding: 0 1rem;
      }
      
      .nav-menu {
        gap: 0.5rem;
      }
      
      .nav-button {
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
      }
      
      .brand-text {
        display: none;
      }
      
      .modern-dropdown {
        min-width: 250px;
      }

      .user-button {
        min-width: 150px;
      }

      .user-name {
        font-size: 0.8rem;
      }

      .user-role {
        font-size: 0.7rem;
      }
    }

    @media (max-width: 768px) {
      .navbar-container {
        height: 70px;
      }
      
      .main-content {
        margin-top: 70px;
        padding: 1rem;
      }
      
      .nav-button span {
        display: none;
      }
      
      .nav-button {
        width: 45px;
        height: 45px;
        justify-content: center;
        padding: 0;
      }
      
      .user-button {
        min-width: auto;
        width: 45px;
        height: 45px;
        justify-content: center;
        padding: 0;
      }
      
      .user-info {
        display: none;
      }

      .login-button span {
        display: none;
      }

      .login-button {
        width: 45px;
        height: 45px;
        padding: 0;
        justify-content: center;
      }
    }

   

    .modern-dropdown {
      animation: slideInDown 0.3s ease-out;
    }

    .nav-button:active {
      transform: translateY(1px);
    }

    .login-button:active,
    .user-button:active {
      transform: translateY(1px);
    }
  `]
})
export class AppComponent implements OnInit {
  title = 'CheTurno';
  currentRoute = '';

  constructor(private router: Router) {}

  ngOnInit() {
    // Escuchar cambios de ruta para actualizar el estado activo
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentRoute = event.url;
      });
  }

  isAuthenticated(): boolean {
    const userRole = localStorage.getItem('userRole');
    return userRole !== null && userRole !== '';
  }

  isAdmin(): boolean {
    return localStorage.getItem('userRole') === 'admin';
  }

  isPatient(): boolean {
    return localStorage.getItem('userRole') === 'patient';
  }

  getUserName(): string {
    return localStorage.getItem('userName') || 'Usuario';
  }

  getUserRoleDisplay(): string {
    const role = localStorage.getItem('userRole');
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'patient':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  }

  goToLogin(): void {
    this.router.navigate(['/']);
  }

  logout(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    this.router.navigate(['/']);
  }

  isRouteActive(route: string): boolean {
    return this.currentRoute.startsWith(route);
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}