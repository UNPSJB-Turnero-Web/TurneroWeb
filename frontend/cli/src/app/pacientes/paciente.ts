export interface Paciente {
    id: number;
    nombre: string; 
    apellido: string;
    email: string;
    telefono: string;
    dni: number | null;
    fechaNacimiento: string; // Usar formato ISO para fechas
    obraSocial?: {
        id: number;
        nombre: string;
        codigo: string;
    };
}