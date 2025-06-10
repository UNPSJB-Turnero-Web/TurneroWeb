import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TurnoService } from './turno.service';
import { Turno } from './turno';
import { DataPackage } from '../data.package';
import { PacienteService } from '../pacientes/paciente.service';
import { StaffMedicoService } from '../staffMedicos/staffMedico.service';
import { ConsultorioService } from '../consultorios/consultorio.service';
import { Paciente } from '../pacientes/paciente';
import { StaffMedico } from '../staffMedicos/staffMedico';
import { Consultorio } from '../consultorios/consultorio';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './turno-detail.component.html',
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
      background: var(--turnos-gradient);
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
      border-left: 4px solid #007bff;
      transition: all 0.3s ease;
    }
    
    .info-item:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.15);
      border-left-color: #28a745;
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
    
    .turno-id-display {
      background: var(--turnos-gradient);
      color: white;
      padding: 12px 20px;
      border-radius: 25px;
      font-weight: bold;
      font-size: 1.3rem;
      box-shadow: 0 4px 16px var(--turnos-shadow);
      display: inline-block;
    }
    
    .paciente-display {
      background: linear-gradient(135deg, #20c997 0%, #17a2b8 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(32,201,151,0.3);
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
    
    .fecha-display {
      background: linear-gradient(135deg, #fd7e14 0%, #e8630a 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(253,126,20,0.3);
      display: inline-block;
    }
    
    .hora-display {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
      padding: 10px 20px;
      border-radius: 20px;
      font-weight: 600;
      box-shadow: 0 4px 16px rgba(23,162,184,0.3);
      display: inline-block;
    }
    
    .estado-display {
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
    }
    
    .estado-pendiente {
      background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
      color: #212529;
    }
    
    .estado-confirmado {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      color: white;
    }
    
    .estado-cancelado {
      background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
      color: white;
    }
    
    .estado-completado {
      background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
      color: white;
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
      background: var(--turnos-gradient);
      color: white;
    }
    
    .btn-save {
      background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
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
      border-color: var(--turnos-primary);
      box-shadow: 0 0 0 0.2rem var(--turnos-shadow);
      background: #f8f9ff;
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
      background: #e3f2fd;
      border: 1px solid #bbdefb;
      border-radius: 10px;
      padding: 0.75rem 1rem;
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #1976d2;
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
export class TurnoDetailComponent {
  turno: Turno = {
    id: 0,
    fecha: '',
    horaInicio: '',
    horaFin: '',
    estado: 'PENDIENTE',
    pacienteId: 0,
    staffMedicoId: 0,
    consultorioId: 0
  };
  
  modoEdicion = false;
  pacientes: Paciente[] = [];
  staffMedicos: StaffMedico[] = [];
  consultorios: Consultorio[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turnoService: TurnoService,
    private pacienteService: PacienteService,
    private staffMedicoService: StaffMedicoService,
    private consultorioService: ConsultorioService,
    private modalService: ModalService
  ) {}

  ngOnInit(): void {
    this.loadDropdownData();
    this.get();
  }

  get(): void {
    const path = this.route.snapshot.routeConfig?.path;

    if (path === 'turnos/new') {
      // Nuevo turno
      this.modoEdicion = true;
      this.turno = {
        id: 0,
        fecha: '',
        horaInicio: '',
        horaFin: '',
        estado: 'PENDIENTE',
        pacienteId: 0,
        staffMedicoId: 0,
        consultorioId: 0
      } as Turno;
    } else if (path === 'turnos/:id') {
      // Detalle o edición
      this.modoEdicion = this.route.snapshot.queryParamMap.get('edit') === 'true';
      const idParam = this.route.snapshot.paramMap.get('id');
      if (!idParam) return;

      const id = Number(idParam);
      if (isNaN(id)) {
        console.error('El ID proporcionado no es un número válido.');
        return;
      }

      this.turnoService.get(id).subscribe({
        next: (dataPackage) => {
          this.turno = <Turno>dataPackage.data;
        },
        error: (err) => {
          console.error('Error al obtener el turno:', err);
        }
      });
    }
  }

  loadDropdownData(): void {
    // Cargar pacientes
    this.pacienteService.all().subscribe((dataPackage: DataPackage<Paciente[]>) => {
      this.pacientes = dataPackage.data || [];
    });

    // Cargar staff médicos
    this.staffMedicoService.all().subscribe((dataPackage: DataPackage<StaffMedico[]>) => {
      this.staffMedicos = dataPackage.data || [];
    });

    // Cargar consultorios
    this.consultorioService.getAll().subscribe((dataPackage: DataPackage<Consultorio[]>) => {
      this.consultorios = dataPackage.data || [];
    });
  }

  save(): void {
    if (!this.turno.pacienteId || !this.turno.staffMedicoId || !this.turno.consultorioId) {
      this.modalService.alert(
        "Error",
        "Debe completar todos los campos obligatorios."
      );
      return;
    }

    const op = this.turno.id
      ? this.turnoService.update(this.turno.id, this.turno)
      : this.turnoService.create(this.turno);
    
    op.subscribe({
      next: () => this.router.navigate(['/turnos']),
      error: (error) => {
        console.error('Error al guardar el turno:', error);
        this.modalService.alert("Error", "No se pudo guardar el turno.");
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/turnos']);
  }

  cancelar(): void {
    if (this.turno.id) {
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

  activarEdicion(): void {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { edit: true },
      queryParamsHandling: 'merge'
    });
    this.modoEdicion = true;
  }

  getEstadoBadgeClass(estado: string): string {
    switch (estado?.toUpperCase()) {
      case 'PENDIENTE':
        return 'estado-display estado-pendiente';
      case 'CONFIRMADO':
        return 'estado-display estado-confirmado';
      case 'CANCELADO':
        return 'estado-display estado-cancelado';
      case 'COMPLETADO':
        return 'estado-display estado-completado';
      default:
        return 'estado-display bg-secondary text-white';
    }
  }

  remove(turno: Turno): void {
    if (turno.id === undefined) {
      this.modalService.alert('Error', 'No se puede eliminar: el turno no tiene ID.');
      return;
    }
    this.modalService
      .confirm(
        "Eliminar Turno",
        "¿Está seguro que desea eliminar este turno?",
        "Si elimina el turno no lo podrá utilizar luego"
      )
      .then(() => {
        this.turnoService.remove(turno.id!).subscribe({
          next: () => {
            this.goBack();
          },
          error: (err) => {
            console.error('Error al eliminar el turno:', err);
            this.modalService.alert('Error', 'No se pudo eliminar el turno. Intente nuevamente.');
          }
        });
      });
  }

  allFieldsEmpty(): boolean {
    return !this.turno?.pacienteId && !this.turno?.staffMedicoId && !this.turno?.consultorioId;
  }
}
