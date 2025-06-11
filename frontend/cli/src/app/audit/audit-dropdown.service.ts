import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { DataPackage } from '../data.package';
import { AuditAction } from './audit-log';

export interface DropdownOption {
  value: number | string;
  label: string;
}

export interface AuditDropdownData {
  centros: DropdownOption[];
  especialidades: DropdownOption[];
  medicos: DropdownOption[];
  estados: DropdownOption[];
  acciones: DropdownOption[];
}

@Injectable({
  providedIn: 'root'
})
export class AuditDropdownService {
  
  constructor(private http: HttpClient) {}

  /** Obtiene todos los datos para los dropdowns de auditoría */
  getAllDropdownData(): Observable<AuditDropdownData> {
    return forkJoin({
      centros: this.getCentrosAtencion(),
      especialidades: this.getEspecialidades(),
      medicos: this.getMedicos(),
      estados: this.getEstadosTurno(),
      acciones: this.getAccionesAuditoria()
    });
  }

  /** Obtiene centros de atención */
  getCentrosAtencion(): Observable<DropdownOption[]> {
    return this.http.get<DataPackage<any[]>>('rest/centroAtencion')
      .pipe(
        map(response => 
          response.data.map(centro => ({
            value: centro.id,
            label: centro.nombre
          }))
        )
      );
  }

  /** Obtiene especialidades */
  getEspecialidades(): Observable<DropdownOption[]> {
    return this.http.get<DataPackage<any[]>>('rest/especialidad')
      .pipe(
        map(response => 
          response.data.map(especialidad => ({
            value: especialidad.id,
            label: especialidad.nombre
          }))
        )
      );
  }

  /** Obtiene médicos/staff médico */
  getMedicos(): Observable<DropdownOption[]> {
    return this.http.get<DataPackage<any[]>>('rest/staffMedico')
      .pipe(
        map(response => 
          response.data.map(medico => ({
            value: medico.id,
            label: `${medico.apellido}, ${medico.nombre}`
          }))
        )
      );
  }

  /** Obtiene médicos por especialidad */
  getMedicosByEspecialidad(especialidadId: number): Observable<DropdownOption[]> {
    return this.http.get<DataPackage<any[]>>(`rest/staffMedico/especialidad/${especialidadId}`)
      .pipe(
        map(response => 
          response.data.map(medico => ({
            value: medico.id,
            label: `${medico.nombre} ${medico.apellido}`
          }))
        )
      );
  }

  /** Obtiene especialidades por centro de atención */
  getEspecialidadesByCentro(centroId: number): Observable<DropdownOption[]> {
    return this.http.get<DataPackage<any[]>>(`rest/especialidad/centro/${centroId}`)
      .pipe(
        map(response => 
          response.data.map(especialidad => ({
            value: especialidad.id,
            label: especialidad.nombre
          }))
        )
      );
  }

  /** Obtiene todos los usuarios que han realizado acciones de auditoría */
  getAuditUsers(): Observable<DropdownOption[]> {
    return this.http.get<DataPackage<string[]>>('rest/audit/users')
      .pipe(
        map(response => 
          response.data.map(user => ({
            value: 0, // For users, we use string filtering
            label: user
          }))
        )
      );
  }

  /** Obtiene estados de turno */
  getEstadosTurno(): Observable<DropdownOption[]> {
    return of([
      { value: 'RESERVADO', label: 'Reservado' },
      { value: 'CONFIRMADO', label: 'Confirmado' },
      { value: 'PRESENTE', label: 'Presente' },
      { value: 'AUSENTE', label: 'Ausente' },
      { value: 'CANCELADO', label: 'Cancelado' },
      { value: 'REPROGRAMADO', label: 'Reprogramado' }
    ]);
  }

  /** Obtiene acciones de auditoría */
  getAccionesAuditoria(): Observable<DropdownOption[]> {
    return of([
      { value: AuditAction.CREATE, label: 'Crear' },
      { value: AuditAction.UPDATE, label: 'Actualizar' },
      { value: AuditAction.DELETE, label: 'Eliminar' },
      { value: AuditAction.CONFIRM, label: 'Confirmar' },
      { value: AuditAction.CANCEL, label: 'Cancelar' },
      { value: AuditAction.RESCHEDULE, label: 'Reprogramar' },
      { value: AuditAction.STATUS_CHANGE, label: 'Cambio de Estado' }
    ]);
  }
}
