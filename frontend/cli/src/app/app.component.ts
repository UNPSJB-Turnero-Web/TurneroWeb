import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="d-flex-column flex-md-row align-items-center p-3">
      <h5 class="my-0 mr-md-auto font-weight-normal">Turnero Web</h5>
      <nav class="my-2 my-md-0 mr-md-3">
        <a class="p-2 text-dark" href="/turnos">Turnos</a>
        <a class="p-2 text-dark" href="/especialidades">Especialidades</a>
        <a class="p-2 text-dark" href="/pacientes">Pacientes</a>
        <a class="p-2 text-dark" href="/agenda">Agenda</a>
        <a class="p-2 text-dark" href="/centros-atencion">Centro de Atención</a>
        <a class="p-2 text-dark" href="/consultorios">Consultorios</a>
        <a class="p-2 text-dark" href="/medicos">Médicos</a>
      </nav>  
    </div>

    <div class="container">  
      <router-outlet></router-outlet>
    </div>
  `,
  styles: [],
})
export class AppComponent {
  title = 'cli';
}