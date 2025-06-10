import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, NgForm } from "@angular/forms";
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
  imports: [FormsModule, CommonModule, NgbTypeaheadModule],
   templateUrl: './consultorio-detail.component.html',

 
  styles: [`
    /* Estilos modernos para Consultorio Detail */
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .modern-card {
      border-radius: 1.5rem;
      overflow: hidden;
      border: none;
      box-shadow: 0 12px 40px rgba(0,0,0,0.1);
      background: white;
      backdrop-filter: blur(20px);
    }
    
    .card-header {
      background: var(--consultorios-gradient);
      border: none;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 200px;
      height: 200px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: rotate(45deg);
    }
    
    .header-content {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      position: relative;
      z-index: 2;
    }
    
    .header-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--consultorios-primary);
      font-size: 1.5rem;
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
    }
    
    .header-text h1 {
      color: white;
      font-size: 1.8rem;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .header-text p {
      color: rgba(255,255,255,0.9);
      margin: 0;
      font-size: 1rem;
    }
    
    .card-body {
      padding: 2rem;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }
    
    .info-item {
      background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
      border-radius: 15px;
      padding: 1.5rem;
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.05);
    }
    
    .info-item:hover {
      transform: translateY(-3px);
      box-shadow: 0 8px 30px rgba(0,0,0,0.12);
    }
    
    .info-label {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .info-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    
    .info-value {
      font-size: 1.1rem;
      color: #343a40;
      font-weight: 500;
    }
    
    /* Estilos del formulario */
    .form-group-modern {
      margin-bottom: 2rem;
    }
    
    .form-label-modern {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .form-icon {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 0.8rem;
      box-shadow: 0 3px 10px rgba(0,0,0,0.2);
    }
    
    .form-control-modern {
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }
    
    .form-control-modern:focus {
      border-color: var(--consultorios-primary);
      box-shadow: 0 0 0 0.2rem var(--consultorios-shadow);
      outline: 0;
    }
    
    .form-help {
      font-size: 0.85rem;
      color: #6c757d;
      margin-top: 0.5rem;
      font-style: italic;
    }
    
    /* Footer y botones */
    .card-footer {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: none;
      padding: 1.5rem 2rem;
    }
    
    .btn-modern {
      border-radius: 25px;
      padding: 0.7rem 1.5rem;
      font-weight: 600;
      border: none;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-back {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-edit {
      background: var(--consultorios-gradient);
      color: white;
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }
    
    .btn-save {
      background: var(--consultorios-gradient);
      color: white;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%);
      color: #212529;
    }
    
    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }
    
    .btn-modern:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }
      
      .card-header {
        padding: 1.5rem;
      }
      
      .header-content {
        flex-direction: column;
        text-align: center;
        gap: 1rem;
      }
      
      .header-text h1 {
        font-size: 1.5rem;
      }
      
      .card-body {
        padding: 1rem;
      }
      
      .info-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }
      
      .d-flex {
        flex-direction: column;
        gap: 0.5rem;
      }
      
      .ms-auto {
        margin-left: 0 !important;
      }
    }
  `]
})
export class ConsultorioDetailComponent implements OnInit {
  @ViewChild('form') form!: NgForm;
  
  consultorio: Consultorio = {
    id: 0,
    numero: 0,
    nombre: "",
    especialidad: "",
    medicoAsignado: "",
    telefono: "",
    centroAtencion: {} as CentroAtencion,
  };
  centrosAtencion: CentroAtencion[] = [];
  selectedCentroAtencion!: CentroAtencion;
  modoEdicion = false;
  esNuevo = false;
  centroSearch = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consultorioService: ConsultorioService,
    private centroAtencionService: CentroAtencionService,
    private modalService: ModalService
  ) { }

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === "consultorios/new") {
      // Nuevo consultorio
      this.modoEdicion = true;
      this.esNuevo = true;
      this.consultorio = {
        id: 0,
        numero: 0,
        nombre: "",
        especialidad: "",
        medicoAsignado: "",
        telefono: "",
        centroAtencion: {} as CentroAtencion,
      };
      this.selectedCentroAtencion = undefined!;
    } else {
      // Edición o vista
      this.esNuevo = false;
      this.route.queryParams.subscribe(params => {
        this.modoEdicion = params['edit'] === 'true';
      });
      this.loadConsultorio();
    }
    this.getCentrosAtencion();
  }

  goBack(): void {
    this.router.navigate(['/consultorios']);
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
    this.consultorio.centroId = this.selectedCentroAtencion.id;
    this.consultorio.nombreCentro = this.selectedCentroAtencion.nombre;

    const op = this.consultorio.id
      ? this.consultorioService.update(this.consultorio.id, this.consultorio)
      : this.consultorioService.create(this.consultorio);

    op.subscribe({
      next: () => this.router.navigate(["/consultorios"]),
      error: (err) => {
        console.error('Error al guardar el consultorio:', err);
        this.modalService.alert("Error", "No se pudo guardar el consultorio.");
      },
    });
  }

private loadConsultorio(): void {
  const id = Number(this.route.snapshot.paramMap.get("id"));
  this.consultorioService.getById(id).subscribe({
    next: (pkg) => {
      console.log('Consultorio cargado:', pkg.data);
      this.consultorio = pkg.data;

      // Asignar el nombre del centro al modelo consultorio
      this.consultorio.centroAtencion = {
        id: this.consultorio.centroId,
        nombre: this.consultorio.nombreCentro,
      } as CentroAtencion;
      this.selectedCentroAtencion = this.consultorio.centroAtencion;
    },
    error: (err) => {
      console.error('Error al cargar el consultorio:', err);
      this.modalService.alert('Error', 'No se pudo cargar la información del consultorio.');
    }
  });
}

  private getCentrosAtencion(): void {
    this.centroAtencionService.getAll().subscribe((res) => {
      this.centrosAtencion = res.data;
    });
  }

  // Autocomplete para el centro de atención
  searchCentros = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap((term) =>
        this.centroAtencionService.search(term).pipe(map((resp) => resp.data))
      )
    );

  formatCentro = (c: CentroAtencion) => c.nombre;

  onSelectCentro(event: any): void {
    this.selectedCentroAtencion = event.item;
  }

  allFieldsEmpty(): boolean {
    return !this.consultorio?.numero &&
      !this.consultorio?.nombre &&
      !this.selectedCentroAtencion;
  }

  remove(): void {
    if (!this.consultorio.id) {
      this.modalService.alert('Error', 'No se puede eliminar: el consultorio no tiene ID.');
      return;
    }
    
    this.modalService
      .confirm(
        "Eliminar Consultorio",
        "¿Está seguro que desea eliminar este consultorio?",
        "Si elimina el consultorio no lo podrá utilizar luego"
      )
      .then(() => {
        this.consultorioService.delete(this.consultorio.id!).subscribe({
          next: () => {
            this.goBack(); // Redirige al usuario a la lista
          },
          error: (err) => {
            console.error('Error al eliminar el consultorio:', err);
            this.modalService.alert('Error', 'No se pudo eliminar el consultorio. Intente nuevamente.');
          }
        });
      });
  }

  activarEdicion(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: true },
      queryParamsHandling: 'merge'
    });
    this.modoEdicion = true;
  }

  cancelar(): void {
    if (!this.esNuevo) {
      // Si estamos editando un consultorio existente, solo salimos del modo edición
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: 'merge'
      });
      this.modoEdicion = false;
    } else {
      // Si es un nuevo consultorio, volvemos a la lista
      this.goBack();
    }
  }
}
