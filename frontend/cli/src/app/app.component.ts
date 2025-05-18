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
        <!-- Primer grupo -->
        <div class="d-flex flex-row gap-2">
          <a class="nav-link text-dark fw-semibold px-3" href="/centrosAtencion">Centro de Atención</a>
          <a class="nav-link text-dark fw-semibold px-3" href="/consultorios">Consultorios</a>
          <a class="nav-link text-dark fw-semibold px-3" href="/especialidades">Especialidades</a>
          <a class="nav-link text-dark fw-semibold px-3" href="/staffMedico">Staff Médico</a>
          <a class="nav-link text-dark fw-semibold px-3" href="/medicos">Médicos</a>
          <a class="nav-link text-dark fw-semibold px-3" href="/pacientes">Pacientes</a>
        </div>
        <!-- Separador visual -->
        <div class="vr mx-4" style="height: 32px; opacity: 0.3;"></div>
        <!-- Segundo grupo -->
        <div class="d-flex flex-row gap-2">
          <a class="nav-link text-dark fw-semibold px-3" href="/agenda">Agenda</a>
          <a class="nav-link text-dark fw-semibold px-3" href="/turnos">Turnos</a>
        </div>
      </nav>
    </div>

    <div class="container" style="margin-top: 90px; padding: 20px;">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'cli';
}