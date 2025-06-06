import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  imports: [],
  template: `
    <div class="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
      <h1 class="display-3 text-primary mb-4">Bienvenido a CheTurno</h1>
      <p class="lead text-secondary text-center mb-5">
        Simplifica la gestión de turnos con nuestra plataforma intuitiva y eficiente.
      </p>
      <a href="/turnos" class="btn btn-primary btn-lg px-5">Ver Turnos</a>
    </div>
  `,
  styles: ``
})
export class HomeComponent {

}
