export interface CentroEspecialidad {
  id?: number;
  centroId: number;
  especialidadId: number;
  // Propiedades adicionales que puedan venir del backend
  centroNombre?: string;
  especialidadNombre?: string;
}
