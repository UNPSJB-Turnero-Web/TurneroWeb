import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Role } from '../inicio-sesion/auth.service';

/**
 * Interfaz para el contexto completo del usuario
 */
export interface UserContext {
  id?: string;
  email: string;
  nombre: string;
  primaryRole: Role;
  allRoles: Role[];
  isAuthenticated: boolean;
  profileCompleted?: boolean; // Indica si el perfil está completo (para usuarios de Google)
}

/**
 * Servicio global para el contexto del usuario autenticado.
 * Mantiene estado reactivo de la información del usuario incluyendo todos sus roles.
 * 
 * Características:
 * - Estado reactivo con BehaviorSubject
 * - Lista completa de roles (directos + heredados)
 * - Métodos de verificación de permisos
 * - Sincronización entre pestañas
 * - Integración con AuthService
 */
@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  private readonly STORAGE_KEY = 'user_context';

  // Estado inicial vacío
  private readonly initialContext: UserContext = {
    email: '',
    nombre: '',
    primaryRole: Role.PACIENTE,
    allRoles: [],
    isAuthenticated: false,
    profileCompleted: true // Por defecto true para usuarios normales
  };

  // BehaviorSubject para estado reactivo
  private userContextSubject = new BehaviorSubject<UserContext>(this.initialContext);

  // Observable público para componentes
  public userContext$ = this.userContextSubject.asObservable();

  constructor() {
    this.initializeFromStorage();
    this.setupStorageListener();
  }

  /**
   * Actualiza el contexto del usuario con datos completos
   * @param userData Datos del usuario desde login
   */
  updateUserContext(userData: {
    email: string;
    nombre: string;
    primaryRole: string;
    allRoles?: string[];
    profileCompleted?: boolean;
  }): void {

    const primaryRole = this.parseRole(userData.primaryRole);
    const allRoles = userData.allRoles
      ? userData.allRoles.map(role => this.parseRole(role)).filter(role => role !== null) as Role[]
      : this.calculateInheritedRoles(primaryRole);

    const newContext: UserContext = {
      email: userData.email,
      nombre: userData.nombre,
      primaryRole,
      allRoles,
      isAuthenticated: true,
      profileCompleted: userData.profileCompleted ?? true // Default true para usuarios normales
    };

    // Actualizar estado reactivo
    this.userContextSubject.next(newContext);

    // Persistir en localStorage para sincronización entre pestañas
    this.saveToStorage(newContext);

    console.log('🔄 UserContext actualizado:', newContext);
  }

  /**
   * Limpia el contexto del usuario (logout)
   */
  clearUserContext(): void {
    this.userContextSubject.next(this.initialContext);
    localStorage.removeItem(this.STORAGE_KEY);
    console.log('🧹 UserContext limpiado');
  }

  /**
   * Obtiene el contexto actual (snapshot)
   * @returns Contexto actual del usuario
   */
  getCurrentContext(): UserContext {
    return this.userContextSubject.value;
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si está autenticado
   */
  isAuthenticated(): boolean {
    return this.userContextSubject.value.isAuthenticated;
  }

  /**
   * Verifica si el perfil del usuario está completo
   * @returns true si el perfil está completo, false si no
   */
  isProfileCompleted(): boolean {
    return this.userContextSubject.value.profileCompleted ?? true;
  }

  /**
   * Obtiene todos los roles del usuario
   * @returns Array de roles del usuario
   */
  getRoles(): Role[] {
    return this.userContextSubject.value.allRoles;
  }

  /**
   * Obtiene el rol principal del usuario
   * @returns Rol principal
   */
  getPrimaryRole(): Role {
    return this.userContextSubject.value.primaryRole;
  }

  /**
   * Verifica si el usuario tiene un rol específico (directo o heredado)
   * @param role Rol a verificar
   * @returns true si el usuario tiene el rol
   */
  hasRole(role: Role): boolean {
    const context = this.userContextSubject.value;
    return context.isAuthenticated && context.allRoles.includes(role);
  }

  /**
   * Verifica si el usuario tiene al menos uno de los roles especificados
   * @param roles Array de roles a verificar
   * @returns true si tiene al menos uno
   */
  hasAnyRole(roles: Role[]): boolean {
    return roles.some(role => this.hasRole(role));
  }

  /**
   * Verifica si el usuario tiene todos los roles especificados
   * @param roles Array de roles a verificar
   * @returns true si tiene todos
   */
  hasAllRoles(roles: Role[]): boolean {
    return roles.every(role => this.hasRole(role));
  }

  /**
   * Obtiene información básica del usuario
   * @returns Datos básicos del usuario
   */
  getUserInfo(): { email: string; nombre: string } | null {
    const context = this.userContextSubject.value;
    if (!context.isAuthenticated) return null;

    return {
      email: context.email,
      nombre: context.nombre
    };
  }

  // ===============================
  // MÉTODOS PRIVADOS
  // ===============================

  /**
   * Inicializa el contexto desde localStorage si existe
   */
  private initializeFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const context: UserContext = JSON.parse(stored);
        // Validar que los roles sean válidos
        if (this.isValidContext(context)) {
          this.userContextSubject.next(context);
          console.log('🔄 UserContext cargado desde storage:', context);
        }
      }
    } catch (error) {
      console.error('❌ Error cargando UserContext desde storage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  /**
   * Configura listener para cambios en localStorage (sincronización entre pestañas)
   */
  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (event) => {
        if (event.key === this.STORAGE_KEY) {
          try {
            if (event.newValue) {
              const context: UserContext = JSON.parse(event.newValue);
              if (this.isValidContext(context)) {
                this.userContextSubject.next(context);
                console.log('🔄 UserContext sincronizado desde otra pestaña');
              }
            } else {
              // Context fue limpiado en otra pestaña
              this.userContextSubject.next(this.initialContext);
            }
          } catch (error) {
            console.error('❌ Error sincronizando UserContext:', error);
          }
        }
      });
    }
  }

  /**
   * Guarda el contexto en localStorage
   */
  private saveToStorage(context: UserContext): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(context));
    } catch (error) {
      console.error('❌ Error guardando UserContext:', error);
    }
  }

  /**
   * Valida que el contexto tenga estructura correcta
   */
  private isValidContext(context: any): context is UserContext {
    return context &&
      typeof context.email === 'string' &&
      typeof context.nombre === 'string' &&
      typeof context.isAuthenticated === 'boolean' &&
      Array.isArray(context.allRoles) &&
      context.primaryRole in Role;
  }

  /**
   * Convierte string a Role enum
   */
  private parseRole(roleString: string): Role {
    return (Role as any)[roleString] || Role.PACIENTE;
  }

  /**
   * Calcula roles heredados basado en la jerarquía (fallback si backend no los envía)
   */
  private calculateInheritedRoles(primaryRole: Role): Role[] {
    const roleHierarchy: Record<Role, Role[]> = {
      [Role.PACIENTE]: [Role.PACIENTE],
      [Role.MEDICO]: [Role.MEDICO, Role.PACIENTE],
      [Role.OPERADOR]: [Role.OPERADOR, Role.PACIENTE],
      [Role.ADMINISTRADOR]: [Role.ADMINISTRADOR, Role.MEDICO, Role.OPERADOR, Role.PACIENTE],
    };

    return roleHierarchy[primaryRole] || [Role.PACIENTE];
  }
}