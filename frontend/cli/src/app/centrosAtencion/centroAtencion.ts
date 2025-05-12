export interface CentroAtencion {
  id: number;
  name: string;
  code: string;
  direccion: string; // Dirección o coordenadas combinadas
  localidad: string;
  provincia: string;
  telefono: string;
  coordenadas: string; // Nueva propiedad para almacenar "latitud,longitud"
}