import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div class="d-flex-column flex-md-row align-items-center p-3">
      <h5 class="my-0 mr-md-auto font-weight-normal">Print the Bill</h5>
      <nav class="my-2 my-md-0 mr-md-3">
        <a class="p-2 text-dark" href="/plays">Plays</a>
        <a class="p-2 text-dark" href="/playtypes">PlayTypes</a>
        <a class="p-2 text-dark" href="/customers">Customers</a>
        <a class="p-2 text-dark" href="/borderos/">Bordero</a>
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
