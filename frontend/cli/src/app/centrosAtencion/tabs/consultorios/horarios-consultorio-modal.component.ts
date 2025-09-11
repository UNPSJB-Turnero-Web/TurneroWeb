import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Consultorio, HorarioConsultorio } from '../../../consultorios/consultorio';
import { ConsultorioService } from '../../../consultorios/consultorio.service';
import { DataPackage } from '../../../data.package';

@Component({
  selector: 'app-horarios-consultorio-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-header">
      <h4 class="modal-title">
        <i class="fa fa-clock me-2"></i>
        Horarios de Atención - {{ consultorio?.nombre }}
      </h4>
      <button type="button" class="btn-close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>

    <div class="modal-body">
      <!-- Alert Messages -->
      <div *ngIf="mensajeError" class="alert alert-danger">
        <i class="fa fa-exclamation-triangle me-2"></i>
        {{ mensajeError }}
      </div>

      <div *ngIf="mensajeExito" class="alert alert-success">
        <i class="fa fa-check-circle me-2"></i>
        {{ mensajeExito }}
      </div>

      <!-- Información del Consultorio -->
      <div class="mb-4 p-3" style="background: rgba(54, 185, 204, 0.05); border-radius: 10px; border: 1px solid rgba(54, 185, 204, 0.2);">
        <div class="d-flex align-items-center">
          <div class="consultorio-icon me-3">
            {{ consultorio?.numero }}
          </div>
          <div>
            <h6 class="mb-1">{{ consultorio?.nombre }}</h6>
            <small class="text-muted">
              <i class="fa fa-map-marker-alt me-1"></i>{{ consultorio?.nombreCentro }}
            </small>
          </div>
        </div>
      </div>

      <!-- Configuración de Horarios por Día -->
      <div class="horarios-configuracion">
        <h6 class="mb-3">
          <i class="fa fa-calendar-week me-2"></i>
          Configuración Semanal
        </h6>
        
        <div class="horarios-grid">
          <div *ngFor="let horario of horariosSemanales; let i = index" 
               class="horario-dia-config">
            
            <!-- Día de la semana -->
            <div class="dia-header">
              <span class="dia-nombre">{{ getDiaNombre(horario.diaSemana) }}</span>
            </div>
            
            <!-- Toggle activo -->
            <div class="dia-toggle">
              <div class="form-check form-switch">
                <input class="form-check-input" 
                       type="checkbox" 
                       [(ngModel)]="horario.activo"
                       [id]="'activo-' + i">
                <label class="form-check-label" [for]="'activo-' + i">
                  {{ horario.activo ? 'Abierto' : 'Cerrado' }}
                </label>
              </div>
            </div>
            
            <!-- Horarios (solo si está activo) -->
            <div class="dia-horarios" *ngIf="horario.activo">
              <div class="row g-2">
                <div class="col-6">
                  <label class="form-label-small">Apertura</label>
                  <input type="time" 
                         class="form-control form-control-sm"
                         [(ngModel)]="horario.horaApertura"
                         [name]="'apertura-' + i">
                </div>
                <div class="col-6">
                  <label class="form-label-small">Cierre</label>
                  <input type="time" 
                         class="form-control form-control-sm"
                         [(ngModel)]="horario.horaCierre"
                         [name]="'cierre-' + i">
                </div>
              </div>
            </div>
            
            <!-- Mensaje de cerrado -->
            <div class="dia-cerrado" *ngIf="!horario.activo">
              <span class="text-muted">
                <i class="fa fa-times-circle me-1"></i>
                Consultorio cerrado este día
              </span>
            </div>
          </div>
        </div>

        <!-- Acciones rápidas -->
        <div class="acciones-rapidas mt-4">
          <h6 class="mb-2">
            <i class="fa fa-bolt me-2"></i>
            Acciones Rápidas
          </h6>
          <div class="d-flex gap-2 flex-wrap">
            <button type="button" 
                    class="btn btn-sm btn-outline-primary" 
                    (click)="aplicarHorarioTodos('08:00', '17:00')">
              <i class="fa fa-sun me-1"></i>8:00 - 17:00 (Todos los días)
            </button>
            <button type="button" 
                    class="btn btn-sm btn-outline-primary" 
                    (click)="aplicarHorarioLaborables('08:00', '17:00')">
              <i class="fa fa-briefcase me-1"></i>8:00 - 17:00 (Solo laborables)
            </button>
            <button type="button" 
                    class="btn btn-sm btn-outline-secondary" 
                    (click)="cerrarFinesDesemana()">
              <i class="fa fa-calendar-times me-1"></i>Cerrar fines de semana
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal-footer">
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">
        <i class="fa fa-times me-2"></i>Cancelar
      </button>
      <button type="button" 
              class="btn btn-primary" 
              (click)="guardarHorarios()"
              [disabled]="guardando">
        <i class="fa" [class.fa-save]="!guardando" [class.fa-spinner]="guardando" [class.fa-spin]="guardando"></i>
        {{ guardando ? 'Guardando...' : 'Guardar Horarios' }}
      </button>
    </div>
  `,
  styles: [`
    .consultorio-icon {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #007bff 0%, #0056b3 100%);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 1.1rem;
      box-shadow: 0 2px 6px rgba(0, 123, 255, 0.3);
    }

    .horarios-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .horario-dia-config {
      border: 1px solid #dee2e6;
      border-radius: 8px;
      padding: 1rem;
      background: #fff;
      transition: all 0.2s ease;
    }

    .horario-dia-config:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      border-color: #007bff;
    }

    .dia-header {
      margin-bottom: 0.75rem;
    }

    .dia-nombre {
      font-weight: 600;
      color: #495057;
      font-size: 0.95rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .dia-toggle {
      margin-bottom: 0.75rem;
    }

    .form-check-input:checked {
      background-color: #28a745;
      border-color: #28a745;
    }

    .form-check-label {
      font-weight: 500;
      color: #495057;
    }

    .dia-horarios {
      margin-top: 0.75rem;
    }

    .form-label-small {
      font-size: 0.8rem;
      font-weight: 500;
      color: #6c757d;
      margin-bottom: 0.25rem;
    }

    .dia-cerrado {
      padding: 0.75rem;
      background: rgba(108, 117, 125, 0.1);
      border-radius: 6px;
      text-align: center;
      font-size: 0.85rem;
    }

    .acciones-rapidas {
      border-top: 1px solid #dee2e6;
      padding-top: 1rem;
    }

    .acciones-rapidas .btn {
      font-size: 0.8rem;
    }

    @keyframes fa-spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class HorariosConsultorioModalComponent implements OnInit {
  consultorio?: Consultorio;
  horariosSemanales: HorarioConsultorio[] = [];
  
  mensajeError = '';
  mensajeExito = '';
  guardando = false;

  private diasSemana = ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO'];

  constructor(
    public activeModal: NgbActiveModal,
    private consultorioService: ConsultorioService
  ) {}

  ngOnInit(): void {
    this.inicializarHorarios();
  }

  private inicializarHorarios(): void {
    if (this.consultorio?.horariosSemanales && this.consultorio.horariosSemanales.length > 0) {
      // Usar horarios existentes
      this.horariosSemanales = [...this.consultorio.horariosSemanales];
    } else {
      // Crear horarios por defecto
      this.horariosSemanales = this.diasSemana.map(dia => ({
        diaSemana: dia,
        horaApertura: this.consultorio?.horaAperturaDefault || '08:00:00',
        horaCierre: this.consultorio?.horaCierreDefault || '17:00:00',
        activo: true
      }));
    }
  }

  getDiaNombre(dia: string): string {
    const nombres: { [key: string]: string } = {
      'LUNES': 'Lunes',
      'MARTES': 'Martes',
      'MIERCOLES': 'Miércoles',
      'JUEVES': 'Jueves',
      'VIERNES': 'Viernes',
      'SABADO': 'Sábado',
      'DOMINGO': 'Domingo'
    };
    return nombres[dia] || dia;
  }

  aplicarHorarioTodos(apertura: string, cierre: string): void {
    this.horariosSemanales.forEach(horario => {
      horario.horaApertura = apertura + ':00';
      horario.horaCierre = cierre + ':00';
      horario.activo = true;
    });
  }

  aplicarHorarioLaborables(apertura: string, cierre: string): void {
    this.horariosSemanales.forEach(horario => {
      if (['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES'].includes(horario.diaSemana)) {
        horario.horaApertura = apertura + ':00';
        horario.horaCierre = cierre + ':00';
        horario.activo = true;
      }
    });
  }

  cerrarFinesDesemana(): void {
    this.horariosSemanales.forEach(horario => {
      if (['SABADO', 'DOMINGO'].includes(horario.diaSemana)) {
        horario.activo = false;
      }
    });
  }

  guardarHorarios(): void {
    this.mensajeError = '';
    this.mensajeExito = '';

    // Validar horarios
    for (const horario of this.horariosSemanales) {
      if (horario.activo && (!horario.horaApertura || !horario.horaCierre)) {
        this.mensajeError = `Por favor, complete los horarios para ${this.getDiaNombre(horario.diaSemana)}`;
        return;
      }
      
      if (horario.activo && horario.horaApertura && horario.horaCierre) {
        const apertura = new Date(`1970-01-01T${horario.horaApertura}`);
        const cierre = new Date(`1970-01-01T${horario.horaCierre}`);
        
        if (apertura >= cierre) {
          this.mensajeError = `La hora de apertura debe ser anterior a la hora de cierre en ${this.getDiaNombre(horario.diaSemana)}`;
          return;
        }
      }
    }

    this.guardando = true;

    // Actualizar el consultorio con los nuevos horarios
    const consultorioActualizado = {
      ...this.consultorio,
      horariosSemanales: this.horariosSemanales
    };

    this.consultorioService.updateHorarios(this.consultorio!.id!, this.horariosSemanales).subscribe({
      next: (response: DataPackage<Consultorio>) => {
        this.guardando = false;
        this.mensajeExito = 'Horarios actualizados correctamente';
        
        setTimeout(() => {
          this.activeModal.close(consultorioActualizado);
        }, 1500);
      },
      error: (error: any) => {
        this.guardando = false;
        console.error('Error al actualizar horarios:', error);
        this.mensajeError = 'Error al actualizar los horarios. Por favor, intente nuevamente.';
      }
    });
  }
}
