import { Component, OnInit } from '@angular/core';
import { CommonModule, Location, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Consultorio } from './consultorio';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultorioService } from './consultorio.service';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { ModalService } from '../modal/modal.service';
import { NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { Observable, debounceTime, distinctUntilChanged, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-consultorio-detail',
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule],
  template: `
    <div *ngIf="consultorio">
      <h2>{{ consultorio.id === 0 ? 'Nuevo Consultorio' : consultorio.nombre | uppercase }}</h2>
      <form #form="ngForm">
        <div class="form-group">
          <label for="numero">Número:</label>
          <input
            name="numero"
            required
            placeholder="Número"
            class="form-control"
            [(ngModel)]="consultorio.numero"
            #numero="ngModel"
          />
          <div *ngIf="numero.invalid && (numero.dirty || numero.touched)" class="alert">
            <div *ngIf="numero.errors?.['required']">
              El número del consultorio es requerido
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input
            name="nombre"
            required
            placeholder="Nombre"
            class="form-control"
            [(ngModel)]="consultorio.nombre"
            #nombre="ngModel"
          />
          <div *ngIf="nombre.invalid && (nombre.dirty || nombre.touched)" class="alert">
            <div *ngIf="nombre.errors?.['required']">
              El nombre del consultorio es requerido
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="centroAtencion">Centro de Atención:</label>
          <input
            class="form-control"
            [ngbTypeahead]="searchCentrosAtencion"
            [inputFormatter]="formatter"
            [resultFormatter]="formatter"
            [(ngModel)]="selectedCentroAtencion"
            (selectItem)="onCentroAtencionSelected($event.item)"
            name="centroAtencion"
            required
          />
        </div>

        <button (click)="goBack()" class="btn btn-danger">Atrás</button>
        <button (click)="save()" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
      </form>
    </div>
  `,
  styles: []
})
export class ConsultorioDetailComponent implements OnInit {
  consultorio: Consultorio = { id: 0, numero: 0, nombre: '', centroAtencion: { id: 0, nombre: '' } };
  centrosAtencion: CentroAtencion[] = [];
  selectedCentroAtencion!: CentroAtencion;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consultorioService: ConsultorioService,
    private centroAtencionService: CentroAtencionService,
    private location: Location,
    private modalService: ModalService
  ) {}

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (!this.selectedCentroAtencion || !this.selectedCentroAtencion.id) {
      this.modalService.alert('Error', 'Debe seleccionar un Centro de Atención válido.');
      return;
    }

    this.consultorio.centroAtencion = this.selectedCentroAtencion;

    if (this.consultorio.id) {
      this.consultorioService.update(this.consultorio.id, this.consultorio).subscribe(() => {
        this.router.navigate(['/consultorios']);
      });
    } else {
      this.consultorioService.create(this.consultorio).subscribe(() => {
        this.router.navigate(['/consultorios']);
      });
    }
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'consultorios/new') {
      this.consultorio = { id: 0, numero: 0, nombre: '', centroAtencion: { id: 0, nombre: '' } };
    } else {
      const id = this.route.snapshot.paramMap.get('id')!;
      this.consultorioService.getById(+id).subscribe((data) => {
        this.consultorio = data; // Asignar el objeto completo
        this.selectedCentroAtencion = data.centroAtencion; // Asignar el Centro de Atención seleccionado
      });
    }
  }

  getCentrosAtencion(): void {
    this.centroAtencionService.getAll().subscribe((res) => {
      this.centrosAtencion = res.data as CentroAtencion[];
    });
  }

  // 🔍 Autocompletado
  searchCentrosAtencion = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        this.centroAtencionService.search(term).pipe(
          map((response) => response.data as CentroAtencion[])
        )
      )
    );

  formatter = (x: CentroAtencion) => x.name;

  onCentroAtencionSelected(centroAtencion: CentroAtencion): void {
    this.selectedCentroAtencion = centroAtencion;
  }

  ngOnInit(): void {
    this.getCentrosAtencion();
    this.get();
  }
}