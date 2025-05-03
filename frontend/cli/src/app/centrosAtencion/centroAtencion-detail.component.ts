import { Component } from '@angular/core';
import { CommonModule, Location, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CentroAtencion } from './centroAtencion';
import { ActivatedRoute } from '@angular/router';
import { CentroAtencionService } from './centroAtencion.service';
import { DataPackage } from '../data.package';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-centro-atencion-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule],
  template: `
<div *ngIf="centroAtencion">
  <h2>{{ centroAtencion.name | uppercase }}</h2>
  <form #form="ngForm">
    <div class="form-group">
      <label for="name">Nombre:</label>
      <input name="name" required placeholder="Nombre" class="form-control" [(ngModel)]="centroAtencion.name" #name="ngModel">
      <div *ngIf="name.invalid && (name.dirty || name.touched)" class="alert">
        <div *ngIf="name.errors?.['required']">
          El nombre del centro es requerido
        </div>
      </div>
    </div>

    <div class="form-group">
      <label for="code">Código:</label>
      <input name="code" placeholder="Código" class="form-control" [(ngModel)]="centroAtencion.code">
    </div>

    <div class="form-group">
      <label for="location">Ubicación:</label>
      <input name="location" placeholder="Ubicación" class="form-control" [(ngModel)]="centroAtencion.location">
    </div>

    <button (click)="goBack()" class="btn btn-danger">Atrás</button>
    <button (click)="save()" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
  </form>
</div>
  `,
  styles: ``
})
export class CentroAtencionDetailComponent {
  centroAtencion!: CentroAtencion;

  constructor(
    private route: ActivatedRoute,
    private centroAtencionService: CentroAtencionService,
    private location: Location
  ) { }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    this.centroAtencionService.save(this.centroAtencion).subscribe((dataPackage) => {
      this.centroAtencion = <CentroAtencion>dataPackage.data;
      this.goBack();
    });
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'centrosAtencion/new') {
      this.centroAtencion = <CentroAtencion>{};
    } else {
      const code = this.route.snapshot.paramMap.get('code')!;
      this.centroAtencionService.get(code).subscribe(dataPackage => {
        this.centroAtencion = <CentroAtencion>dataPackage.data;
      });
    }
  }

  ngOnInit(): void {
    this.get();
  }
}
