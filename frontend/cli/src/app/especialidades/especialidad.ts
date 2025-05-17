export interface Especialidad {
  id: number;
  nombre: string;
  descripcion: string;
  tieneMedicosActivos?: boolean;
  tieneTurnosProgramados?: boolean;

}