import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div
      class="d-flex flex-row align-items-center p-3 bg-light shadow"
      style="width: 100%; height: 70px; position: fixed; top: 0; left: 0; z-index: 1000;"
    >
      <a href="/" class="text-decoration-none me-4">
        <h5 class="my-0 font-weight-bold text-primary">Turnero Web</h5>
      </a>
      <nav class="nav">
        <a class="nav-link text-dark fw-semibold" href="/turnos">Turnos</a>
        <a class="nav-link text-dark fw-semibold" href="/especialidades">Especialidades</a>
        <a class="nav-link text-dark fw-semibold" href="/agenda">Agenda</a>
        <a class="nav-link text-dark fw-semibold" href="/centrosAtencion">Centro de Atención</a>
        <a class="nav-link text-dark fw-semibold" href="/consultorios">Consultorios</a>
        <a class="nav-link text-dark fw-semibold" href="/medicos">Médicos</a>
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