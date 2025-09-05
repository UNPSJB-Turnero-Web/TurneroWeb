import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class UsuarioAuthService {
  private rolesOperador = ["admin", "medico", "operador"]; // roles que pueden actuar como operador

  constructor() {}
  get userRole(): string | null {
    return localStorage.getItem("userRole");
  }

  esOperador(): boolean {
    const role = this.userRole;
    return role ? this.rolesOperador.includes(role) : false;
  }

  // si más adelante querés otro tipo de validación
  tieneRol(rol: string): boolean {
    return this.userRole === rol;
  }

  agregarRolOperador(nuevoRol: string) {
    if (!this.rolesOperador.includes(nuevoRol)) {
      this.rolesOperador.push(nuevoRol);
    }
  }
}
