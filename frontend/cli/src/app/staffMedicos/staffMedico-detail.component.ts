import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StaffMedicoService } from './staffMedico.service';
import { StaffMedico } from './staffMedico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';
import { Medico } from '../medicos/medico';
import { Especialidad } from '../especialidades/especialidad';
import { CentroAtencionService } from '../centrosAtencion/centroAtencion.service';
import { MedicoService } from '../medicos/medico.service';
import { EspecialidadService } from '../especialidades/especialidad.service';
import { DataPackage } from '../data.package';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-staff-medico-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './staffMedico-detail.component.html',
  styles: [`
    /* Estilos modernos para el detail component */
    .card {
      border-radius: 1.15rem;
      overflow: hidden;
      border: none;
      box-shadow: 0 8px 32px rgba(0,0,0,0.12);
      background: white;
    }
    
    .card-header {
      background: var(--staff-medico-gradient);
      border: none;
      padding: 1.5rem 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: translate(30px, -30px);
    }
    
    .card-body {
      padding: 2rem;
      background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
    }
    
    .info-item {
      background: white;
      border-radius: 15px;
      padding: 1.5rem;
      margin-bottom: 1rem;
      box-shadow: 0 4px 16px rgba(0,0,0,0.08);
      border-left: 4px solid var(--staff-medico-primary);
      transition: all 0.3s ease;
    }
    
    .info-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-left-color: #007bff;
    }
    
    .info-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 1rem;
      font-size: 1.1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
    
    .info-label {
      font-weight: 600;
      color: #495057;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 0.5rem;
    }
    
    .info-value {
      font-size: 1.1rem;
      color: #212529;
      font-weight: 500;
    }
    
    .id-display {
      background: var(--staff-medico-gradient);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: bold;
      font-size: 1.3rem;
      box-shadow: 0 4px 16px var(--staff-medico-shadow);
      display: inline-block;
    }
    
    .centro-display {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(23,162,184,0.3);
      display: inline-block;
    }
    
    .medico-display {
      background: linear-gradient(135deg, #6f42c1 0%, #5a32a3 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(111,66,193,0.3);
      display: inline-block;
    }
    
    .especialidad-display {
      background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(253,126,20,0.3);
      display: inline-block;
    }
    
    .card-footer {
      background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
      border: none;
      padding: 1.5rem 2rem;
    }
    
    .btn-modern {
      padding: 0.75rem 1.5rem;
      border-radius: 25px;
      font-weight: 600;
      border: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
    }
    
    .btn-modern:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    }
    
    .btn-modern:active {
      transform: translateY(0);
    }
    
    .btn-back {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-edit {
      background: var(--staff-medico-gradient);
      color: white;
    }
    
    .btn-save {
      background: var(--staff-medico-gradient);
      color: white;
    }
    
    .btn-cancel {
      background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%);
      color: white;
    }
    
    .btn-delete {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }
    
    /* Estilos del formulario */
    .form-control-modern {
      border: 2px solid #e9ecef;
      border-radius: 15px;
      padding: 1rem 1.25rem;
      font-size: 1rem;
      transition: all 0.3s ease;
      background: white;
    }
    
    .form-control-modern:focus {
      border-color: var(--staff-medico-primary);
      box-shadow: 0 0 0 0.2rem var(--staff-medico-shadow);
      background: #f0fff4;
    }
    
    .form-label-modern {
      font-weight: 600;
      color: #495057;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
    }
    
    .form-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 0.75rem;
      font-size: 0.8rem;
      color: white;
    }
    
    .form-group-modern {
      margin-bottom: 2rem;
      position: relative;
    }
    
    .form-help {
      background: #e8f5e8;
      border: 1px solid #c3e6cb;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #155724;
    }
    
    .alert-modern {
      border: none;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      margin-top: 0.75rem;
      background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
      border-left: 4px solid #dc3545;
      color: #721c24;
    }
    
    /* Animaciones */
    @keyframes slideInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    
    .info-item {
      animation: slideInUp 0.4s ease-out;
    }
    
    .form-group-modern {
      animation: slideInUp 0.3s ease-out;
    }
    
    /* Responsive */
    @media (max-width: 768px) {
      .card-body {
        padding: 1.5rem;
      }
      
      .card-header {
        padding: 1.25rem 1.5rem;
      }
      
      .card-footer {
        padding: 1.25rem 1.5rem;
      }
      
      .info-item {
        padding: 1.25rem;
        margin-bottom: 1rem;
      }
      
      .btn-modern {
        padding: 0.625rem 1.25rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class StaffMedicoDetailComponent {
  staffMedico: StaffMedico = { id: 0, centroAtencionId: 0, medicoId: 0, especialidadId: 0 };
  centros: CentroAtencion[] = [];
  medicos: Medico[] = [];
  especialidades: Especialidad[] = [];
  modoEdicion = false;
  esNuevo = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private staffMedicoService: StaffMedicoService,
    private centroAtencionService: CentroAtencionService,
    private medicoService: MedicoService,
    private especialidadService: EspecialidadService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    const path = this.route.snapshot.routeConfig?.path;
    if (path === "staffMedico/new") {
      // Nuevo staff médico
      this.modoEdicion = true;
      this.esNuevo = true;
      this.staffMedico = { id: 0, centroAtencionId: 0, medicoId: 0, especialidadId: 0 };
      this.loadCentros();
      this.loadMedicos();
      this.loadEspecialidades();
    } else {
      // Edición o vista
      this.route.queryParams.subscribe(params => {
        this.modoEdicion = params['edit'] === 'true';
      });
      this.get();
    }
  }

  get(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      // Modo edición
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      this.esNuevo = false;
      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }
      this.staffMedicoService.get(id).subscribe({
        next: (dataPackage) => {
          const data = dataPackage.data;

          // Mapear los datos del backend al modelo StaffMedico
   // Asignar los datos del backend al modelo StaffMedico
        this.staffMedico = {
          id: data.id,
          centroAtencionId: data.centro?.id || 0,
          medicoId: data.medico?.id || 0,
          especialidadId: data.especialidad?.id || 0,
          centro: data.centro || undefined, // Objeto completo del centro
          medico: data.medico || undefined, // Objeto completo del médico
          especialidad: data.especialidad || undefined, // Objeto completo de la especialidad
        };


          // Cargar listas de opciones
          this.loadCentros();
          this.loadMedicos();
          this.loadEspecialidades();
        },
        error: (err) => {
          console.error('Error al obtener el staff médico:', err);
          alert('No se pudo cargar el staff médico. Intente nuevamente.');
        }
      });
    } else {
      // Modo nuevo
      this.modoEdicion = true;
      this.esNuevo = true;
      this.staffMedico = { id: 0, centroAtencionId: 0, medicoId: 0, especialidadId: 0 };
      this.loadCentros();
      this.loadMedicos();
      this.loadEspecialidades();
    }
  }

  save(): void {
    if (!this.staffMedico.centroAtencionId || !this.staffMedico.medicoId || !this.staffMedico.especialidadId) {
      this.modalService.alert(
        "Error",
        "Debe completar todos los campos obligatorios."
      );
      return;
    }

    const op = this.esNuevo 
      ? this.staffMedicoService.create(this.staffMedico)
      : this.staffMedicoService.update(this.staffMedico.id, this.staffMedico);

    op.subscribe({
      next: () => this.router.navigate(['/staffMedico']),
      error: (error) => {
        console.error('Error al guardar el staff médico:', error);
        this.modalService.alert("Error", "No se pudo guardar el staff médico.");
      }
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
    if (this.staffMedico.id && !this.esNuevo) {
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {},
        queryParamsHandling: 'merge'
      });
      this.modoEdicion = false;
    } else {
      this.goBack();
    }
  }

  goBack(): void {
    this.router.navigate(['/staffMedico']);
  }

  remove(staffMedico: StaffMedico): void {
    if (staffMedico.id === undefined) {
      this.modalService.alert('Error', 'No se puede eliminar: el staff médico no tiene ID.');
      return;
    }
    this.modalService
      .confirm(
        "Eliminar Staff Médico",
        "¿Está seguro que desea eliminar este staff médico?",
        "Si elimina el staff médico no lo podrá utilizar luego"
      )
      .then(() => {
        this.staffMedicoService.remove(staffMedico.id!).subscribe({
          next: () => {
            this.goBack();
          },
          error: (err) => {
            console.error('Error al eliminar el staff médico:', err);
            this.modalService.alert('Error', 'No se pudo eliminar el staff médico. Intente nuevamente.');
          }
        });
      });
  }

  loadCentros(): void {
    this.centroAtencionService.all().subscribe((dp: DataPackage) => {
      this.centros = dp.data as CentroAtencion[];
    });
  }

  loadMedicos(): void {
    this.medicoService.getAll().subscribe((dp: DataPackage) => {
      this.medicos = dp.data as Medico[];
    });
  }

  loadEspecialidades(): void {
    this.especialidadService.all().subscribe((dp: DataPackage) => {
      this.especialidades = dp.data as Especialidad[];
    });
  }

getCentroNombre(): string {
  return this.staffMedico.centro?.nombre || 'Sin centro';
}

getMedicoNombre(): string {
  const medico = this.staffMedico.medico;
  return medico ? `${medico.nombre} ${medico.apellido}` : 'Sin médico';
}

  getEspecialidadNombre(): string {
    return this.staffMedico.especialidad?.nombre || 'Sin especialidad';
  }

  onMedicoSeleccionado(): void {
    // Limpiar especialidad seleccionada cuando cambia el médico
    this.staffMedico.especialidadId = 0;
  }

  getEspecialidadesDisponibles(): Especialidad[] {
    if (!this.staffMedico.medicoId) {
      return this.especialidades;
    }

    const medicoSeleccionado = this.medicos.find(m => m.id === this.staffMedico.medicoId);
    if (medicoSeleccionado && medicoSeleccionado.especialidades && medicoSeleccionado.especialidades.length > 0) {
      // Filtrar solo las especialidades que tiene el médico
      return this.especialidades.filter(esp => 
        medicoSeleccionado.especialidades!.some(medicoEsp => medicoEsp.id === esp.id)
      );
    }

    // Fallback: si el médico no tiene especialidades múltiples definidas, mostrar todas
    return this.especialidades;
  }allFieldsEmpty(): boolean {
  return !this.staffMedico?.centroAtencionId && !this.staffMedico?.medicoId && !this.staffMedico?.especialidadId;
}
}