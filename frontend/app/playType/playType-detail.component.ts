import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayTypeService } from './playType.service';
import { PlayType } from './playType';

@Component({
  selector: 'app-playtype-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container mt-4">
      <h2>{{ playType.id ? 'Editar Tipo de Obra' : 'Nuevo Tipo de Obra' }}</h2>
      <form (ngSubmit)="save()">
        <div class="mb-3">
          <label class="form-label">Tipo</label>
          <input
            [(ngModel)]="playType.type"
            name="name"
            class="form-control"
            required
          />
        </div>
        <button type="submit" class="btn btn-primary">Guardar</button>
        <a routerLink="/playtypes" class="btn btn-secondary ms-2">Cancelar</a>
      </form>
    </div>
  `,
})
export class PlayTypeDetailComponent {
  playType: PlayType = { id: 0, type: '' };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private playTypeService: PlayTypeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.playTypeService.get(id).subscribe((dataPackage) => {
        this.playType = dataPackage.data as PlayType;
      });
    }
  }

  save(): void {
    this.playTypeService.save(this.playType).subscribe(() => {
      this.router.navigate(['/playtypes']);
    });
  }
}
