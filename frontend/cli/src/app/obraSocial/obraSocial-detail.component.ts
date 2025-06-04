import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ObraSocialService } from './obraSocial.service';
import { ObraSocial } from './obraSocial';
import { ModalService } from '../modal/modal.service';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-obra-social-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './obraSocial-detail.component.html',
})
export class ObraSocialDetailComponent {
  obraSocial: ObraSocial = { id: 0, nombre: '', codigo: '', descripcion: '' };
  modoEdicion = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private obraSocialService: ObraSocialService,
    private modalService: ModalService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'obraSocial/new') {
      this.modoEdicion = true;
    } else {
      const id = +this.route.snapshot.paramMap.get('id')!;
      this.obraSocialService.get(id).subscribe((dp: DataPackage<ObraSocial>) => {
        this.obraSocial = dp.data;
        this.route.queryParams.subscribe(params => {
          this.modoEdicion = params['edit'] === 'true';
        });
      });
    }
  }

  save(): void {
    const op = this.obraSocial.id
      ? this.obraSocialService.update(this.obraSocial.id, this.obraSocial)
      : this.obraSocialService.create(this.obraSocial);
    op.subscribe(() => {
      this.router.navigate(['/obraSocial']);
    });
  }

  goBack(): void {
    this.location.back();
  }

  activarEdicion(): void {
    this.modoEdicion = true;
  }
}