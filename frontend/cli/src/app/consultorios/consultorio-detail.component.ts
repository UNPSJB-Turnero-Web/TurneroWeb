import { Component, OnInit } from "@angular/core";
import { CommonModule, Location, UpperCasePipe } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbTypeaheadModule } from "@ng-bootstrap/ng-bootstrap";
import {
  Observable,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  map,
} from "rxjs";

import { Consultorio } from "./consultorio";
import { CentroAtencion } from "../centrosAtencion/centroAtencion";
import { ConsultorioService } from "./consultorio.service";
import { CentroAtencionService } from "../centrosAtencion/centroAtencion.service";
import { ModalService } from "../modal/modal.service";

@Component({
  selector: "app-consultorio-detail",
  standalone: true,
  imports: [UpperCasePipe, FormsModule, CommonModule, NgbTypeaheadModule],
  template: `
    <div *ngIf="consultorio">
      <h2>
        <ng-container *ngIf="consultorio.id && consultorio.id !== 0; else nuevo">
          Editando consultorio: {{ consultorio.name }}
        </ng-container>
        <ng-template #nuevo>
          Nuevo Consultorio
        </ng-template>
      </h2>
      <form #form="ngForm">
        <!-- Número -->
        <div class="form-group">
          <label for="numero">Número:</label>
          <input
            type="number"
            name="numero"
            required
            placeholder="Número"
            class="form-control"
            [(ngModel)]="consultorio.numero"
            #numero="ngModel"
            min="1"
          />
          <div
            *ngIf="numero.invalid && (numero.dirty || numero.touched)"
            class="alert"
          >
            <div *ngIf="numero.errors?.['required']">
              El número del consultorio es requerido
            </div>
            <div *ngIf="numero.errors?.['min']">
              El número debe ser mayor o igual a 1
            </div>
          </div>
          <div
            *ngIf="numero.invalid && (numero.dirty || numero.touched)"
            class="alert"
          >
            <div *ngIf="numero.errors?.['required']">
              El número del consultorio es requerido
            </div>
          </div>
        </div>

        <!-- Nombre -->
        <div class="form-group">
          <label for="nombre">Nombre:</label>
          <input
            name="nombre"
            required
            placeholder="Nombre"
            class="form-control"
            [(ngModel)]="consultorio.name"
            #nombre="ngModel"
          />
          <div
            *ngIf="nombre.invalid && (nombre.dirty || nombre.touched)"
            class="alert"
          >
            <div *ngIf="nombre.errors?.['required']">
              El nombre del consultorio es requerido
            </div>
          </div>
        </div>

        <!-- Centro de Atención (typeahead) -->
        <div class="form-group">
          <label for="centroAtencion">Centro de Atención:</label>
          <input
            name="centroAtencion"
            required
            class="form-control"
            [ngbTypeahead]="searchCentrosAtencion"
            [inputFormatter]="formatter"
            [resultFormatter]="formatter"
            [(ngModel)]="selectedCentroAtencion"
            (selectItem)="onCentroAtencionSelected($event.item)"
          />
        </div>

        <!-- Botones -->
        <button (click)="goBack()" class="btn btn-danger me-2">Atrás</button>
        <button
          (click)="save()"
          class="btn btn-success"
          [disabled]="form.invalid || allFieldsEmpty()"
        >
          Guardar
        </button>
        <button *ngIf="consultorio.id" (click)="remove(consultorio)" class="btn btn-outline-danger">Eliminar</button>
      </form>
    </div>
  `,
  styles: [],
})
export class ConsultorioDetailComponent implements OnInit {
  consultorio: Consultorio = {
    id: 0,
    numero: 0,
    name: "",
    centroAtencion: {} as CentroAtencion,
  };
  centrosAtencion: CentroAtencion[] = [];
  selectedCentroAtencion!: CentroAtencion;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private consultorioService: ConsultorioService,
    private centroAtencionService: CentroAtencionService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.getCentrosAtencion();
    this.loadConsultorio();
  }

  goBack(): void {
    this.location.back();
  }

  save(): void {
    if (!this.selectedCentroAtencion?.id) {
      this.modalService.alert(
        "Error",
        "Debe seleccionar un Centro de Atención válido."
      );
      return;
    }

    this.consultorio.centroAtencion = this.selectedCentroAtencion;

    const op = this.consultorio.id
      ? this.consultorioService.update(this.consultorio.id, this.consultorio)
      : this.consultorioService.create(this.consultorio);

    op.subscribe({
      next: () => this.router.navigate(["/consultorios"]),
      error: () =>
        this.modalService.alert("Error", "No se pudo guardar el consultorio."),
    });
  }

  private loadConsultorio(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === "consultorios/new") {
      // Nuevo
      this.consultorio = {
        id: 0,
        numero: 0,
        name: "",
        centroAtencion: {} as CentroAtencion,
      };
    } else {
      // Edición
      const id = Number(this.route.snapshot.paramMap.get("id"));
      this.consultorioService.getById(id).subscribe((pkg) => {
        this.consultorio = pkg.data;
        this.selectedCentroAtencion = this.consultorio.centroAtencion;
      });
    }
  }

  private getCentrosAtencion(): void {
    this.centroAtencionService.getAll().subscribe((res) => {
      this.centrosAtencion = res.data;
    });
  }

  // Autocomplete
  searchCentrosAtencion = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        this.centroAtencionService.search(term).pipe(map((resp) => resp.data))
      )
    );

  formatter = (c: CentroAtencion) => c.name;

  onCentroAtencionSelected(c: CentroAtencion): void {
    this.selectedCentroAtencion = c;
  }

  allFieldsEmpty(): boolean {
    return !this.consultorio?.numero &&
           !this.consultorio?.name &&
           !this.selectedCentroAtencion;
  }

  remove(consultorio: Consultorio): void {
    if (consultorio.id === undefined) {
      alert('No se puede eliminar: el consultorio no tiene ID.');
      return;
    }
    this.modalService
      .confirm(
        "Eliminar consultorio",
        "¿Está seguro que desea eliminar el consultorio?",
        "Si elimina el consultorio no lo podrá utilizar luego"
      )
      .then(() => {
        this.consultorioService.delete(consultorio.id!).subscribe({
          next: () => {
            this.goBack(); // Redirige al usuario a la lista
          },
          error: (err) => {
            console.error('Error al eliminar el consultorio:', err);
            alert('No se pudo eliminar el consultorio. Intente nuevamente.');
          }
        });
      });
  }
}
