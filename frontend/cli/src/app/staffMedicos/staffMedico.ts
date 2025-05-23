import { Especialidad } from '../especialidades/especialidad';
import { Medico } from '../medicos/medico';
import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface StaffMedico {
  id: number;
  centroAtencionId: number;
  medicoId: number;
  especialidadId: number;
  // Opcionalmente, para mostrar nombres:
  centroAtencionName?: string;
  medicoNombre?: string;
  especialidadNombre?: string;
}