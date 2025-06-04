import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TurnoService } from './turno.service';
import { Turno } from './turno';
import { DataPackage } from '../data.package';

@Component({
  selector: 'app-turno-detail',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<div class="container mt-4">
  <form (ngSubmit)="save()" #form="ngForm">
    <h2>
      <ng-container *ngIf="turno.id && turno.id !== 0; else nuevo">
        Editando: {{ turno.nombre }}
      </ng-container>
      <ng-template #nuevo>
        Nuevo Turno
      </ng-template>
    </h2>
    <div class="mb-3">
      <label class="form-label">Nombre</label>
      <input [(ngModel)]="turno.nombre" name="nombre" class="form-control" required />
    </div>
    <div class="mb-3">
      <label class="form-label">Código</label>
      <input [(ngModel)]="turno.codigo" name="codigo" class="form-control" required />
    </div>
    <div class="mb-3">
      <label class="form-label">Fecha</label>
      <input [(ngModel)]="turno.fecha" name="fecha" type="date" class="form-control" required />
    </div>
    <div class="mb-3">
      <label class="form-label">Hora Inicio</label>
      <input [(ngModel)]="turno.horaInicio" name="horaInicio" type="time" class="form-control" required />
    </div>
    <div class="mb-3">
      <label class="form-label">Hora Fin</label>
      <input [(ngModel)]="turno.horaFin" name="horaFin" type="time" class="form-control" required />
    </div>
    <div class="mb-3">
      <label class="form-label">Estado</label>
      <select [(ngModel)]="turno.estado" name="estado" class="form-control" required>
        <option value="pendiente">Pendiente</option>
        <option value="confirmado">Confirmado</option>
        <option value="cancelado">Cancelado</option>
      </select>
    </div>
    <button type="submit" class="btn btn-success" [disabled]="form.invalid">Guardar</button>
    <button type="button" class="btn btn-secondary ms-2" (click)="goBack()">Cancelar</button>
  </form>
</div>
  `,
})
export class TurnoDetailComponent {
  turno: Turno = {
    id: 0, nombre: '', codigo: '', fecha: '', horaInicio: '', horaFin: '', estado: '', pacienteId: 0, pacienteNombre: '', especialidadStaffMedicoId: 0, especialidadStaffMedicoNombre: '',
    pacienteApellido: '',
    staffMedicoId: 0,
    staffMedicoNombre: '',
    staffMedicoApellido: '',
    centroAtencionId: 0,
    centroAtencionNombre: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private turnoService: TurnoService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id')!;
    if (id) {
      this.turnoService.get(id).subscribe((dp: DataPackage<Turno>) => {
        this.turno = dp.data;
      });
    }
  }

  save(): void {
    const op = this.turno.id
      ? this.turnoService.update(this.turno.id, this.turno)
      : this.turnoService.create(this.turno);
    op.subscribe(() => {
      this.router.navigate(['/turnos']);
    });
  }

  goBack(): void {
    this.location.back();
  }
}
