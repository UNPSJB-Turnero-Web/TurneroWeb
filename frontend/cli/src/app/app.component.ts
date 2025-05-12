import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="d-flex flex-column p-3 bg-light shadow" style="height: 100vh; width: 250px; position: fixed;">
      <a href="/" class="text-decoration-none">
        <h5 class="my-0 mb-4 font-weight-bold text-primary">Turnero Web</h5>
      </a>
      <nav class="nav flex-column">
        <a class="nav-link text-dark fw-semibold" href="/turnos">Turnos</a>
        <a class="nav-link text-dark fw-semibold" href="/especialidades">Especialidades</a>
        <a class="nav-link text-dark fw-semibold" href="/agenda">Agenda</a>
        <a class="nav-link text-dark fw-semibold" href="/centrosAtencion">Centro de Atención</a>
        <a class="nav-link text-dark fw-semibold" href="/consultorios">Consultorios</a>
        <a class="nav-link text-dark fw-semibold" href="/medicos">Médicos</a>
      </nav>
    </div>

    <div class="container" style="margin-left: 270px; padding-top: 20px;">
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'cli';
}