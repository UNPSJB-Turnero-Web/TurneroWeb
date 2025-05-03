import { CentroAtencion } from '../centrosAtencion/centroAtencion';

export interface Consultorio {
    id: number;
    code: string;
    name: string;
    centroAtencion: CentroAtencion; // Relación con Centro de Atención
}