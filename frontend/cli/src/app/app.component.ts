import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgbDropdownModule, CommonModule, ],
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
        <div class="nav-menu">
          <!-- Menú General -->
          <div ngbDropdown class="nav-dropdown">
            <button 
              class="nav-button"
              ngbDropdownToggle
              id="generalDropdown"
            >
              <i class="fas fa-building me-2"></i>
              <span>General</span>
              <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <div ngbDropdownMenu class="modern-dropdown" aria-labelledby="generalDropdown">
              <a ngbDropdownItem class="dropdown-item" href="/centrosAtencion">
                <i class="fas fa-hospital icon-item icon-centro-atencion"></i>
                <div class="item-content">
                  <span class="item-title">Centros de Atención</span>
                  <span class="item-desc">Gestionar centros médicos</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/consultorios">
                <i class="fas fa-door-open icon-item icon-consultorios"></i>
                <div class="item-content">
                  <span class="item-title">Consultorios</span>
                  <span class="item-desc">Administrar consultorios</span>
                </div>
              </a>
            </div>
          </div>

          <!-- Menú Persona -->
          <div ngbDropdown class="nav-dropdown">
            <button 
              class="nav-button"
              ngbDropdownToggle
              id="personasDropdown"
            >
              <i class="fas fa-users me-2"></i>
              <span>Personas</span>
              <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <div ngbDropdownMenu class="modern-dropdown" aria-labelledby="personasDropdown">
              <a ngbDropdownItem class="dropdown-item" href="/medicos">
                <i class="fas fa-user-md icon-item icon-medicos"></i>
                <div class="item-content">
                  <span class="item-title">Médicos</span>
                  <span class="item-desc">Gestionar profesionales</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/staffMedico">
                <i class="fas fa-user-nurse icon-item icon-staff-medico"></i>
                <div class="item-content">
                  <span class="item-title">Staff Médico</span>
                  <span class="item-desc">Personal médico</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/pacientes">
                <i class="fas fa-user-injured icon-item icon-pacientes"></i>
                <div class="item-content">
                  <span class="item-title">Pacientes</span>
                  <span class="item-desc">Registro de pacientes</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/obraSocial">
                <i class="fas fa-heart-pulse icon-item icon-obra-social"></i>
                <div class="item-content">
                  <span class="item-title">Obras Sociales</span>
                  <span class="item-desc">Coberturas médicas</span>
                </div>
              </a>
            </div>
          </div>

          <!-- Menú Agenda -->
          <div ngbDropdown class="nav-dropdown">
            <button 
              class="nav-button"
              ngbDropdownToggle
              id="agendaDropdown"
            >
              <i class="fas fa-calendar-alt me-2"></i>
              <span>Agenda</span>
              <i class="fas fa-chevron-down ms-2"></i>
            </button>
            <div ngbDropdownMenu class="modern-dropdown" aria-labelledby="agendaDropdown">
              <a ngbDropdownItem class="dropdown-item" href="/disponibilidades-medico">
                <i class="fas fa-clock icon-item icon-disponibilidad"></i>
                <div class="item-content">
                  <span class="item-title">Disponibilidades</span>
                  <span class="item-desc">Horarios médicos</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/esquema-turno">
                <i class="fas fa-calendar-check icon-item icon-esquema-turno"></i>
                <div class="item-content">
                  <span class="item-title">Esquemas de Turno</span>
                  <span class="item-desc">Plantillas de turnos</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/agenda">
                <i class="fas fa-calendar-week icon-item icon-agenda"></i>
                <div class="item-content">
                  <span class="item-title">Agenda</span>
                  <span class="item-desc">Vista de agenda</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/agenda/dias-excepcionales">
                <i class="fas fa-calendar-times icon-item icon-dias-excepcionales"></i>
                <div class="item-content">
                  <span class="item-title">Días Excepcionales</span>
                  <span class="item-desc">Feriados y mantenimiento</span>
                </div>
              </a>
              <a ngbDropdownItem class="dropdown-item" href="/turnos">
                <i class="fas fa-clipboard-list icon-item icon-turnos"></i>
                <div class="item-content">
                  <span class="item-title">Turnos</span>
                  <span class="item-desc">Gestión de citas</span>
                </div>
              </a>
            </div>
          </div>
        </div>

        <!-- USER SECTION (opcional para futuro) -->
        <div class="user-section">
          <div ngbDropdown class="nav-dropdown">
            <button class="user-button" ngbDropdownToggle id="userDropdown">
              <div class="user-avatar">
                <i class="fas fa-user"></i>
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
      backdrop-filter: blur(20px);
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
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      font-weight: 600;
      font-size: 0.95rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      display: flex;
      align-items: center;
      cursor: pointer;
    }

    .nav-button:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
      color: white;
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
    }

    .dropdown-item:hover {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
      color: #495057 !important;
      transform: translateX(5px);
    }

    .dropdown-item:focus {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
      color: #495057 !important;
      transform: translateX(5px);
      outline: none;
    }

    .dropdown-item:active {
      background: linear-gradient(135deg, #e9ecef 0%, #dee2e6 100%) !important;
      color: #495057 !important;
    }

    .icon-item {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1rem;
      flex-shrink: 0;
    }

    /* User dropdown specific icons */
    .user-dropdown .icon-item {
      background: var(--turnos-gradient);
    }

    .icon-configuracion {
      background: var(--centro-atencion-gradient) !important;
    }

    .icon-logout {
      background: var(--action-delete) !important;
    }

    /* Audit specific icons */
    .icon-audit-dashboard {
      background: var(--obra-social-gradient) !important;
    }

    .icon-audit-logs {
      background: var(--turnos-gradient) !important;
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

    /* USER SECTION */
    .user-section {
      display: flex;
      align-items: center;
    }

    .user-button {
      background: rgba(255,255,255,0.1);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 50%;
      width: 45px;
      height: 45px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
      cursor: pointer;
    }

    .user-button:hover {
      background: rgba(255,255,255,0.2);
      transform: scale(1.1);
    }

    .user-avatar {
      font-size: 1.2rem;
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
        border-radius: 50%;
        padding: 0;
        justify-content: center;
      }
    }

    /* ANIMACIONES */
    .nav-dropdown:hover .nav-button {
      transform: translateY(-2px);
    }

    .dropdown-item:hover .icon-item {
      transform: scale(1.1);
    }

    /* ESTADOS ACTIVOS */
    .nav-button.active {
      background: rgba(255,255,255,0.25);
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }
  `],
})
export class AppComponent implements OnInit {
  title = 'cli';

  constructor(private router: Router) {}

  ngOnInit() {
    // Any initialization logic can go here
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

  logout(): void {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    this.router.navigate(['/']);
  }
}