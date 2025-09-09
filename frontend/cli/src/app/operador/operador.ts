export interface Operador {
  id: number;
  nombre: string;
  apellido: string;
  dni: number;
  email: string;
  password?: string;
  activo: boolean;
  telefono?: string;
}
