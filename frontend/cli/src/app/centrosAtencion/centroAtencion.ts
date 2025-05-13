export interface CentroAtencion {
  id?: number;
  name: string;
  code: string;
  direccion: string;
  localidad: string;
  provincia: string;
  telefono: string;
  coordenadas?: string;
  latitud: number;
  longitud: number;
}