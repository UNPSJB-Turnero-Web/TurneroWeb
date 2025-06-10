import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div
      class="d-flex flex-row align-items-center p-3 bg-light shadow-sm"
      style="width: 100%; height: 70px; position: fixed; top: 0; left: 0; z-index: 1000;"
    >
      <a href="/" class="text-decoration-none me-5">
        <h5 class="my-0 fw-bold text-primary">CheTurno</h5>
      </a>
      <nav class="nav flex-row gap-2">
        <!-- Menú General -->
        <div class="dropdown">
          <a
            class="nav-link dropdown-toggle text-dark fw-semibold px-3"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            >General</a
          >
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="/centrosAtencion">Centros de Atención</a>
            </li>
            <li>
              <a class="dropdown-item" href="/consultorios">Consultorios</a>
            </li>
          </ul>
        </div>
        <!-- Menú Persona -->
        <div class="dropdown">
          <a
            class="nav-link dropdown-toggle text-dark fw-semibold px-3"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            >Persona</a
          >
          <ul class="dropdown-menu">
            <li>
              <a class="dropdown-item" href="/medicos">Médicos</a>
            </li>
            <li>
              <a class="dropdown-item" href="/staffMedico">Staff Médico</a>
            </li>
            <li>
              <a class="dropdown-item" href="/pacientes">Pacientes</a>
            </li>
              <li>
              <a class="dropdown-item" href="/obraSocial">Obra Social</a>
            </li>
          </ul>
        </div>
        <!-- Menú Agenda -->
        <div class="dropdown">
          <a
            class="nav-link dropdown-toggle text-dark fw-semibold px-3"
            href="#"
            role="button"
            data-bs-toggle="dropdown"
            aria-expanded="true"
            >Agenda</a
          >
          <ul class="dropdown-menu">
                        <li>
              <a class="dropdown-item" href="/disponibilidades-medico">Disponibilidades Médico</a>
            </li>
            <li>
              <a class="dropdown-item" href="/esquema-turno">Esquema Turno</a>
            </li>

            <li>
              <a class="dropdown-item" href="/agenda">Agenda</a>
            </li>
            <li>
              <a class="dropdown-item" href="/turnos">Turnos</a>
            </li>
          </ul>
        </div>
      </nav>
    </div>

    <div class="container" style="margin-top: 90px; padding: 20px;">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [`
    .navbar-menu {
      font-size: 1.08rem;
      font-weight: 500;
    }
    .dropdown-menu {
      border-radius: 0.7rem;
      box-shadow: 0 4px 24px 0 rgba(0,0,0,0.08);
      min-width: 220px;
      padding: 0.5rem 0;
    }
    .dropdown-item {
      padding: 0.7rem 1.5rem;
      transition: background 0.2s, color 0.2s;
      border-radius: 0.4rem;
      font-size: 1.02rem;
      display: flex;
      align-items: center;
      gap: 0.7rem;
    }
    .dropdown-item:hover, .dropdown-item:focus {
      background: #e3f0fc;
      color: #0d6efd;
    }
    .nav-link.dropdown-toggle {
      font-size: 1.08rem;
      font-weight: 600;
      color: #222 !important;
      transition: color 0.2s;
    }
    .nav-link.dropdown-toggle:hover, .nav-link.dropdown-toggle:focus {
      color: #0d6efd !important;
      background: #f2f8fd;
      border-radius: 0.5rem;
    }
    .dropdown-menu li:not(:last-child) {
      border-bottom: 1px solid #f1f1f1;
    }
  `],
})
export class AppComponent {
  title = 'cli';
}