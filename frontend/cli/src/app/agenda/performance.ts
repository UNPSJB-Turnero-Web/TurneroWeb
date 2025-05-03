import { Turno } from "../turnos/turno";

export interface Performance {
    audience: number;
    turno: Turno; // Relación con Turno
}