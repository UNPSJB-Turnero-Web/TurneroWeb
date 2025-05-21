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
  templateUrl: './consultorio-detail.component.html',
  styles: `
  .card {
      border-radius: 1rem ;
      overflow: hidden;
      }

.custom-tabs .nav-link {
  font-weight: 500;
  color: #1565c0;
  border: none;
  background: none;
  border-radius: 0.5rem 0.5rem 0 0;
  transition: background 0.2s, color 0.2s, box-shadow 0.2s;
  margin-right: 0.2rem;
  padding: 0.75rem 1.5rem;
  font-size: 1.08rem;
  box-shadow: none;
}

.custom-tabs .nav-link.active {
  color: #fff !important;
  background: linear-gradient(90deg, #1976d2 80%, #42a5f5 100%);
  box-shadow: 0 4px 16px -8px #1976d2;
  border: none;
}

.custom-tabs .nav-link:hover:not(.active) {
  background: #e3f2fd;
  color: #1976d2;
}
  `
})
export class ConsultorioDetailComponent implements OnInit {
  consultorio: Consultorio = {
    id: 0,
    numero: 0,
    name: "",
    especialidad: "",
    medicoAsignado: "",
    telefono: "",
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
  ) { }

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === "consultorios/new") {
      // Nuevo consultorio
      this.modoEdicion = true;
      this.consultorio = {
        id: 0,
        numero: 0,
        name: "",
        especialidad: "",
        medicoAsignado: "",
        telefono: "",
        centroAtencion: {} as CentroAtencion,
      };
      this.selectedCentroAtencion = undefined!;
    } else {
      // Edición o vista
      this.route.queryParams.subscribe(params => {
        this.modoEdicion = params['edit'] === 'true';
      });
      this.loadConsultorio();
    }
    this.getCentrosAtencion();
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
        especialidad: "",
        medicoAsignado: "",
        telefono: "",
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
  modoEdicion = false;

  activarEdicion() {
    this.modoEdicion = true;
  }


}
