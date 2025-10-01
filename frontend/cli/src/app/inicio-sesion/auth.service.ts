import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpErrorResponse,
  HttpHeaders,
} from "@angular/common/http";
import { Router } from "@angular/router";
import { Observable, throwError, BehaviorSubject } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { JwtHelperService } from "@auth0/angular-jwt";
import { DataPackage } from "../data.package";
import { PacienteService } from "../pacientes/paciente.service";
import { ModalService } from "../modal/modal.service";

/**
 * Interfaz para los datos de login compatibles con InicioSesionComponent
 */
export interface LoginData {
  email: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Interfaz para la respuesta del backend
 */
export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  email: string;
  nombre: string;
  role: string;
}

/**
 * Interfaz para el refresh token request
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Interfaz para el check email request
 */
export interface CheckEmailRequest {
  email: string;
}

/**
 * Interfaz para el check email response
 */
export interface CheckEmailResponse {
  email: string;
  nombre: string;
  role: string;
}

/**
 * Interfaz para el request de cambio de contraseña
 */
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

/**
 * Interfaz para el request de actualización de perfil
 */
export interface UpdateProfileRequest {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
}

/**
 * Interfaz para la respuesta de actualización de perfil
 */
export interface UpdateProfileResponse {
  message: string;
  user: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
    dni: string;
    role: string;
  };
}

/**
 * Enum para los roles del sistema
 */
export enum Role {
  PACIENTE = 'PACIENTE',
  MEDICO = 'MEDICO',
  OPERADOR = 'OPERADOR',
  ADMINISTRADOR = 'ADMINISTRADOR'
}

/**
 * Jerarquía de roles: qué roles incluye cada uno
 */
export const ROLE_HIERARCHY: Record<Role, Role[]> = {
  [Role.PACIENTE]: [],
  [Role.MEDICO]: [Role.PACIENTE],
  [Role.OPERADOR]: [Role.PACIENTE],
  [Role.ADMINISTRADOR]: [Role.PACIENTE, Role.MEDICO, Role.OPERADOR],
};

/**
 * Servicio de autenticación que maneja JWT con Spring Boot backend
 */
@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly API_BASE_URL = "rest/api/auth";
  private readonly ACCESS_TOKEN_KEY = "access_token";
  private readonly REFRESH_TOKEN_KEY = "refresh_token";
  private readonly USER_DATA_KEY = "user_data";
  private readonly SESSION_SYNC_KEY = "session_sync";
  private readonly SESSION_TIMESTAMP_KEY = "session_timestamp";

  private jwtHelper = new JwtHelperService();
  private authStateSubject = new BehaviorSubject<boolean>(
    this.isAuthenticated()
  );
  public authState$ = this.authStateSubject.asObservable();

  private tokenRefreshTimer: any = null;
  private storageListener: ((event: StorageEvent) => void) | null = null;
  private timestampUpdateTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private pacienteService: PacienteService,
    private modalService: ModalService
  ) {
    // Inicializar sincronización de sesiones entre pestañas
    this.initializeSessionSync();
    
    // Inicializar el auto-refresh si hay un token válido
    this.initializeTokenRefresh();
    
    // Inicializar actualización periódica de timestamp para sessionStorage
    this.startPeriodicTimestampUpdate();
  }

  /**
   * Verifica si ya existe una sesión activa que impida el login
   * @returns true si hay una sesión activa que debe prevenir el login
   */
  public hasActiveSessionConflict(): boolean {
    const sessionTimestamp = localStorage.getItem(this.SESSION_TIMESTAMP_KEY);
    const currentTime = Date.now();
    
    if (sessionTimestamp) {
      const sessionTime = parseInt(sessionTimestamp);
      // Si hay una sesión de hace menos de 30 minutos
      if (currentTime - sessionTime < 1800000) { // 30 minutos
        // Verificar si hay tokens válidos en cualquier storage
        return this.hasValidTokensInAnyStorage();
      }
    }
    
    return false;
  }

  /**
   * Realiza el login del usuario
   * @param loginData Datos de login con email, password y rememberMe
   * @returns Observable con la respuesta del backend
   */
  login(loginData: LoginData): Observable<DataPackage<LoginResponse>> {
    // Verificar si ya existe una sesión activa
    if (this.hasActiveSessionConflict()) {
      const errorMessage = 'Ya existe una sesión activa. Por favor, cierre la sesión en las otras pestañas antes de iniciar una nueva sesión.';
      this.modalService.alert('Sesión Activa Detectada', errorMessage);
      return throwError(() => new Error(errorMessage));
    }

    const loginPayload = {
      email: loginData.email,
      password: loginData.password,
    };

    return this.http
      .post<DataPackage<LoginResponse>>(
        `${this.API_BASE_URL}/login`,
        loginPayload
      )
      .pipe(
        tap((response) => {
          if (response.data) {
            this.storeTokens(response.data, loginData.rememberMe);
            this.authStateSubject.next(true);
            this.updateSessionTimestamp();
            
            // Notificar a otras pestañas sobre el login con un pequeño delay
            // para asegurar que los datos se hayan guardado correctamente
            setTimeout(() => {
              this.notifyOtherTabs('login', {
                email: response.data.email,
                role: response.data.role
              });
            }, 100);
            
            // Programar el refresh automático para el nuevo token
            this.scheduleTokenRefresh(response.data.accessToken);
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Verifica si un email existe en la base de datos
   * @param email Email a verificar
   * @returns Observable con la información del usuario si existe
   */
  checkEmail(email: string): Observable<DataPackage<CheckEmailResponse>> {
    const checkEmailPayload: CheckEmailRequest = {
      email: email,
    };

    return this.http
      .post<DataPackage<CheckEmailResponse>>(
        `${this.API_BASE_URL}/check-email`,
        checkEmailPayload
      )
      .pipe(catchError(this.handleError));
  }

  /**
   * Maneja el auto-login después del registro
   * @param loginResponse Respuesta del registro con tokens
   * @param rememberMe Si mantener la sesión activa
   */
  handlePostRegistrationLogin(
    loginResponse: LoginResponse,
    rememberMe: boolean = false
  ): void {
    this.storeTokens(loginResponse, rememberMe);
    this.authStateSubject.next(true);
    
    // Notificar a otras pestañas sobre el login con delay
    setTimeout(() => {
      this.notifyOtherTabs('login', {
        email: loginResponse.email,
        role: loginResponse.role
      });
    }, 100);
    
    // Programar el refresh automático para el nuevo token
    this.scheduleTokenRefresh(loginResponse.accessToken);
  }

  /**
   * Almacena los tokens en el storage apropiado
   * @param loginResponse Respuesta del login
   * @param rememberMe Si debe usar localStorage o sessionStorage
   */
  private storeTokens(loginResponse: LoginResponse, rememberMe: boolean): void {
    // Limpiar datos de usuario anterior antes de almacenar los nuevos
    this.clearAllStorageData();

    const storage = rememberMe ? localStorage : sessionStorage;

    storage.setItem(this.ACCESS_TOKEN_KEY, loginResponse.accessToken);
    storage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken);
    storage.setItem(
      this.USER_DATA_KEY,
      JSON.stringify({
        email: loginResponse.email,
        fullName: loginResponse.nombre,
      })
    );

    // Guardar userRole siempre en localStorage para sincronización entre pestañas
    localStorage.setItem("userRole", loginResponse.role);
    
    // Actualizar timestamp de sesión
    this.updateSessionTimestamp();
  }

  /**
   * Maneja la expiración completa de tokens notificando al usuario
   * @param message Mensaje a mostrar al usuario
   */
  private handleTokenExpired(message: string): void {
    console.log('🚨 Manejo de expiración de tokens:', message);
    
    // Cancelar cualquier timer de refresh activo
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }

    // Limpiar completamente todo el almacenamiento
    this.clearAllStorageData();

    // Actualizar estado de autenticación
    this.authStateSubject.next(false);

    // Mostrar notificación al usuario
    this.modalService.alert(
      'Sesión Expirada',
      message
    );

    // Redirigir al login después de un breve delay para que se vea el modal
    setTimeout(() => {
      this.router.navigate(["/ingresar"]);
    }, 100);
  }

  /**
   * Limpia completamente todo el almacenamiento (localStorage y sessionStorage)
   */
  private clearAllStorageData(): void {
    console.log('🧹 Limpiando todo el almacenamiento...');

    // Tokens de autenticación JWT
    const tokenKeys = [
      this.ACCESS_TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_DATA_KEY,
    ];

    // Datos comunes a todos los roles
    const commonKeys = [
      "userRole",
      "userId",
      "userName",
      "userEmail",
      "id",
      "currentUser",
    ];

    // Datos específicos de pacientes
    const pacienteKeys = ["pacienteId", "patientData", "patientDNI"];

    // Datos específicos de médicos
    const medicoKeys = [
      "medicoId",
      "medicoData",
      "medicoMatricula",
      "especialidadId",
      "staffMedicoId",
      "notificacionesMedico",
    ];

    // Datos específicos de operadores
    const operadorKeys = [
      "operadorId",
      "operadorData",
      "operadorDNI",
      "centroAsignado",
    ];

    // Datos específicos de administradores
    const adminKeys = ["adminId", "adminData", "permissions"];

    // Claves de sincronización de sesión
    const sessionSyncKeys = [this.SESSION_SYNC_KEY, this.SESSION_TIMESTAMP_KEY];

    // Combinar todas las claves que pueden existir
    const allKeys = [
      ...tokenKeys,
      ...commonKeys,
      ...pacienteKeys,
      ...medicoKeys,
      ...operadorKeys,
      ...adminKeys,
      ...sessionSyncKeys,
    ];

    // Limpiar de localStorage
    allKeys.forEach((key) => {
      localStorage.removeItem(key);
    });

    // Limpiar de sessionStorage
    allKeys.forEach((key) => {
      sessionStorage.removeItem(key);
    });
  }

  /**
   * Verifica si el usuario está autenticado
   * @returns true si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      console.log('🔍 No hay token disponible');
      return false;
    }
    
    const isExpired = this.jwtHelper.isTokenExpired(token);
    if (isExpired) {
      console.log('⏰ Token expirado, intentando refresh automático...');
      // Si el token está expirado, intentar refresh automático silencioso
      this.attemptSilentRefresh();
      return false;
    }
    
    return true;
  }

  /**
   * Intenta hacer un refresh silencioso del token
   */
  private attemptSilentRefresh(): void {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ No hay refresh token disponible');
      return;
    }

    this.refreshAccessToken().subscribe({
      next: (response) => {
        if (response.data) {
          console.log('✅ Token renovado silenciosamente');
          this.updateStoredTokens(response.data);
          this.authStateSubject.next(true);
          this.scheduleTokenRefresh(response.data.accessToken);
        }
      },
      error: (error) => {
        console.log('❌ Error en refresh silencioso:', error);
        // Si falla el refresh silencioso, la sesión ha expirado completamente
        this.handleTokenExpired('Su sesión ha expirado. Por favor, inicie sesión nuevamente.');
      }
    });
  }

  /**
   * Obtiene el token JWT del storage
   * @returns El token JWT o null si no existe
   */
  getToken(): string | null {
    return (
      localStorage.getItem(this.ACCESS_TOKEN_KEY) ||
      sessionStorage.getItem(this.ACCESS_TOKEN_KEY)
    );
  }

  /**
   * Obtiene el refresh token del storage
   * @returns El refresh token o null si no existe
   */
  getRefreshToken(): string | null {
    return (
      localStorage.getItem(this.REFRESH_TOKEN_KEY) ||
      sessionStorage.getItem(this.REFRESH_TOKEN_KEY)
    );
  }

  /**
   * Obtiene el rol del usuario desde el token JWT
   * @returns El rol del usuario o null si no se puede obtener
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      // El rol viene en el claim 'role' del token JWT
      return decodedToken.role || null;
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  }

  /**
   * Obtiene el email del usuario desde el token JWT
   * @returns El email del usuario o null si no se puede obtener
   */
  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const decodedToken = this.jwtHelper.decodeToken(token);
      // El email viene en el subject del token JWT
      return decodedToken.sub || null;
    } catch (error) {
      console.error("Error decodificando token:", error);
      return null;
    }
  }

  /**
   * Obtiene el nombre del usuario desde los datos almacenados
   * @returns El nombre completo del usuario o null si no se puede obtener
   */
  getUserName(): string | null {
    const userData =
      localStorage.getItem(this.USER_DATA_KEY) ||
      sessionStorage.getItem(this.USER_DATA_KEY);

    if (!userData) return null;

    try {
      const parsedData = JSON.parse(userData);
      return parsedData.fullName || null;
    } catch (error) {
      console.error("Error parseando datos de usuario:", error);
      return null;
    }
  }

  /**
   * Mapea el rol del backend a las rutas de redirección
   * @param backendRole Rol del backend (PACIENTE, MEDICO, OPERARIO, ADMINISTRADOR)
   * @returns Ruta de redirección correspondiente
   */
  mapRoleToRoute(backendRole: string): string {
    const roleMapping: { [key: string]: string } = {
      PACIENTE: "paciente",
      MEDICO: "medico",
      OPERADOR: "operador",
      ADMINISTRADOR: "admin",
    };

    return roleMapping[backendRole] || "home";
  }

  /**
   * Redirige al usuario según su rol
   */
  /**
   * Redirige al usuario a la ruta correspondiente según su rol
   */
  redirectByRole(): void {
    const role = this.getUserRole();
    if (!role) {
      this.router.navigate(["/"]);
      return;
    }
    switch (role.toUpperCase()) {
      case "PACIENTE":
        this.router.navigate(["/paciente-dashboard"]);
        break;
      case "OPERADOR":
        this.router.navigate(["/operador-dashboard"]);
        break;
      case "MEDICO":
        this.router.navigate(["/medico-dashboard"]);
        break;
      case "ADMINISTRADOR":
        this.router.navigate(["/admin-dashboard"]);
        break;
      default:
        this.router.navigate(["/"]);
        break;
    }
  }

  /**
   * Renueva el token de acceso usando el refresh token
   * @returns Observable con la nueva respuesta de tokens
   */
  refreshToken(): Observable<DataPackage<LoginResponse>> {
    const refreshToken = this.getRefreshToken();

    if (!refreshToken) {
      return throwError(() => new Error("No hay refresh token disponible"));
    }

    const refreshPayload: RefreshTokenRequest = {
      refreshToken: refreshToken,
    };

    return this.http
      .post<DataPackage<LoginResponse>>(
        `${this.API_BASE_URL}/refresh`,
        refreshPayload
      )
      .pipe(
        tap((response) => {
          if (response.data) {
            // Determinar si estamos en localStorage o sessionStorage
            const usingLocalStorage =
              localStorage.getItem(this.ACCESS_TOKEN_KEY) !== null;
            this.storeTokens(response.data, usingLocalStorage);
          }
        }),
        catchError((error) => {
          // Si el refresh token también está expirado, cerrar sesión
          this.logout();
          return this.handleError(error);
        })
      );
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    // Cancelar el timer de refresh si existe
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    // Limpiar todos los datos de usuario (incluyendo tokens JWT)
    this.clearAllStorageData();

    // Actualizar estado de autenticación
    this.authStateSubject.next(false);

    // Notificar a otras pestañas sobre el logout
    this.notifyOtherTabs('logout');

    // Redirigir al login
    this.router.navigate(["/ingresar"]);
  }

  /**
   * Obtiene los datos del usuario almacenados
   * @returns Datos del usuario o null
   */
  getUserData(): { email: string; fullName: string } | null {
    const userDataStr =
      localStorage.getItem(this.USER_DATA_KEY) ||
      sessionStorage.getItem(this.USER_DATA_KEY);

    if (userDataStr) {
      try {
        return JSON.parse(userDataStr);
      } catch (error) {
        console.error("Error parsing user data:", error);
        return null;
      }
    }

    return null;
  }

  /**
   * Maneja errores HTTP
   * @param error Error HTTP
   * @returns Observable con error
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = "Error desconocido";

    if (error.error instanceof ErrorEvent) {
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.error && typeof error.error === "object") {
        // Usar message o status_text de DataPackage
        errorMessage =
          error.error.message || error.error.status_text || errorMessage;
      } else {
        switch (error.status) {
          case 401:
            errorMessage = "Credenciales inválidas";
            break;
          case 403:
            errorMessage = "Acceso denegado";
            break;
          case 500:
            errorMessage = "Error interno del servidor";
            break;
          default:
            errorMessage = `Error del servidor: ${error.status}`;
        }
      }
    }

    console.error("Error en AuthService:", errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Verifica si el token está próximo a expirar (dentro de 5 minutos)
   * @returns true si el token está próximo a expirar
   */
  isTokenExpiringSoon(): boolean {
    const token = this.getToken();
    if (!token) return false;

    const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
    if (!expirationDate) return false;

    const now = new Date();
    const timeUntilExpiration = expirationDate.getTime() - now.getTime();
    const fiveMinutesInMs = 5 * 60 * 1000;

    return timeUntilExpiration < fiveMinutesInMs;
  }

  /**
   * Cambia la contraseña del usuario autenticado
   * @param request Datos de cambio de contraseña
   * @returns Observable con la respuesta del servidor
   */
  changePassword(request: ChangePasswordRequest): Observable<DataPackage<any>> {
    return this.http
      .post<DataPackage<any>>(`${this.API_BASE_URL}/change-password`, request, {
        headers: new HttpHeaders({ "Content-Type": "application/json" })
      })
      .pipe(catchError(this.handleError));
  }

  /**
   * Actualiza los datos del perfil del usuario autenticado
   * @param request Datos de actualización de perfil
   * @returns Observable con la respuesta del servidor
   */
  updateProfile(request: UpdateProfileRequest): Observable<DataPackage<UpdateProfileResponse>> {
    return this.http
      .put<DataPackage<UpdateProfileResponse>>(`${this.API_BASE_URL}/update-profile`, request, {
        headers: new HttpHeaders({ "Content-Type": "application/json" })
      })
      .pipe(
        tap((response) => {
          // Actualizar los datos del usuario en el localStorage si la actualización es exitosa
          if (response.status_code === 200 && response.data?.user) {
            // Obtener datos actuales del usuario
            const currentUserStr = localStorage.getItem('currentUser');
            if (currentUserStr) {
              try {
                const currentUser = JSON.parse(currentUserStr);
                const updatedUser = {
                  ...currentUser,
                  nombre: response.data.user.nombre,
                  apellido: response.data.user.apellido,
                  email: response.data.user.email,
                  telefono: response.data.user.telefono,
                  dni: response.data.user.dni
                };
                localStorage.setItem('currentUser', JSON.stringify(updatedUser));
                
                // Notificar a otras pestañas sobre el cambio
                localStorage.setItem('userDataUpdated', Date.now().toString());
              } catch (error) {
                console.error('Error updating user data in localStorage:', error);
              }
            }
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Intenta renovar automáticamente el token si está próximo a expirar
   * @returns Promise que se resuelve cuando el token se renueva o no es necesario
   */
  autoRefreshToken(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isTokenExpiringSoon()) {
        this.refreshToken().subscribe({
          next: () => resolve(),
          error: (error) => reject(error),
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Obtiene el ID del paciente actual de forma robusta
   * @returns El ID del paciente o null si no se encuentra
   */
  getCurrentPatientId(): number | null {
    // Intentar obtener desde pacienteId

    const pacienteId = localStorage.getItem("pacienteId");
    if (pacienteId && pacienteId !== "null") {
      const id = parseInt(pacienteId);
      if (!isNaN(id) && id > 0) {
        return id;
      }
    }

    // Intentar obtener desde patientData como respaldo
    const patientData = localStorage.getItem("patientData");
    if (patientData && patientData !== "null") {
      try {
        const parsedData = JSON.parse(patientData);
        if (parsedData && parsedData.id) {
          const id = parseInt(parsedData.id.toString());
          if (!isNaN(id) && id > 0) {
            // Guardar el ID encontrado para futuras referencias
            localStorage.setItem("pacienteId", id.toString());
            return id;
          }
        }
      } catch (error) {
        console.error("Error al parsear patientData:", error);
      }
    }

    // Intentar obtener desde el token JWT si está disponible
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      try {
        const decodedToken = this.jwtHelper.decodeToken(token);
        console.log("Token decodificado:", decodedToken);

        // Buscar el claim pacienteId específicamente para usuarios tipo PACIENTE
        if (decodedToken && decodedToken.pacienteId) {
          const id = parseInt(decodedToken.pacienteId.toString());
          if (!isNaN(id) && id > 0) {
            console.log("ID del paciente encontrado en token:", id);
            localStorage.setItem("pacienteId", id.toString());
            return id;
          }
        }

        console.warn("No se encontró pacienteId en el token JWT");
      } catch (error) {
        console.error("Error al decodificar token:", error);
      }
    }

    return null;
  }

  /**
   * Método público para manejar errores de autenticación desde otros servicios
   * @param error Error HTTP recibido
   * @param customMessage Mensaje personalizado para el usuario
   */
  public handleAuthError(error: any, customMessage?: string): void {
    if (error.status === 401 || error.status === 403) {
      const message = customMessage || 'Su sesión ha expirado o no tiene permisos. Por favor, inicie sesión nuevamente.';
      this.handleTokenExpired(message);
    }
  }



  /**
   * Obtiene información sobre el estado del token
   * @returns Información útil para debugging
   */
  public getTokenInfo(): { hasToken: boolean; isExpired: boolean; expiresAt: Date | null; timeLeft: string } {
    const token = this.getToken();
    
    if (!token) {
      return { hasToken: false, isExpired: true, expiresAt: null, timeLeft: 'No token' };
    }

    try {
      const isExpired = this.jwtHelper.isTokenExpired(token);
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      
      let timeLeft = 'N/A';
      if (expirationDate) {
        const now = new Date();
        const timeUntilExpiry = expirationDate.getTime() - now.getTime();
        if (timeUntilExpiry > 0) {
          const minutes = Math.floor(timeUntilExpiry / (1000 * 60));
          const seconds = Math.floor((timeUntilExpiry % (1000 * 60)) / 1000);
          timeLeft = `${minutes}m ${seconds}s`;
        } else {
          timeLeft = 'Expirado';
        }
      }

      return { hasToken: true, isExpired, expiresAt: expirationDate, timeLeft };
    } catch (error) {
      return { hasToken: true, isExpired: true, expiresAt: null, timeLeft: 'Error' };
    }
  }

  /**
   * Obtiene todos los roles heredados por un rol dado, incluyendo el rol mismo
   * @param role Rol base
   * @returns Set de roles incluyendo el rol base y todos los heredados
   */
  getAllInheritedRoles(role: Role): Set<Role> {
    const roles = new Set<Role>();
    const visit = (r: Role) => {
      if (!roles.has(r)) {
        roles.add(r);
        ROLE_HIERARCHY[r]?.forEach(visit);
      }
    };
    visit(role);
    return roles;
  }

  /**
   * Verifica si el usuario actual tiene el rol requerido o lo hereda según la jerarquía
   * @param required Rol requerido
   * @returns true si el usuario tiene el rol o lo hereda
   */
  hasRole(required: Role): boolean {
    const userRole = this.getUserRole();
    if (!userRole) return false;
    const inherited = this.getAllInheritedRoles(userRole as Role);
    return userRole === required || inherited.has(required);
  }

  /**
   * Verifica si el usuario actual tiene al menos uno de los roles requeridos o los hereda
   * @param requiredRoles Array de roles requeridos
   * @returns true si el usuario tiene al menos uno de los roles o los hereda
   */
  hasAnyRole(requiredRoles: Role[]): boolean {
    return requiredRoles.some(role => this.hasRole(role));
  }

  /**
   * Inicializa el sistema de refresh automático de tokens
   */
  private initializeTokenRefresh(): void {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.scheduleTokenRefresh(token);
    }
  }

  /**
   * Programa el refresh del token antes de que expire
   * @param token Token actual
   */
  private scheduleTokenRefresh(token: string): void {
    // Cancelar timer anterior si existe
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }

    try {
      const expirationDate = this.jwtHelper.getTokenExpirationDate(token);
      if (!expirationDate) return;

      const now = new Date();
      const timeUntilExpiry = expirationDate.getTime() - now.getTime();
      
      // Renovar 2 minutos antes de que expire (o la mitad del tiempo si es menos de 4 minutos)
      const refreshTime = Math.max(timeUntilExpiry - (2 * 60 * 1000), timeUntilExpiry / 2);

      if (refreshTime > 0) {
        console.log(`🔄 Token refresh programado en ${Math.round(refreshTime / 1000)} segundos`);
        
        this.tokenRefreshTimer = setTimeout(() => {
          this.refreshAccessToken().subscribe({
            next: (response) => {
              console.log('✅ Token renovado automáticamente');
              if (response.data) {
                this.updateStoredTokens(response.data);
                this.scheduleTokenRefresh(response.data.accessToken);
              }
            },
            error: (error) => {
              console.error('❌ Error al renovar token automáticamente:', error);
              // Si falla el refresh automático, notificar al usuario y cerrar sesión
              this.handleTokenExpired('La sesión ha expirado. Por favor, inicie sesión nuevamente.');
            }
          });
        }, refreshTime);
      }
    } catch (error) {
      console.error('Error al programar refresh de token:', error);
    }
  }

  /**
   * Actualiza los tokens almacenados manteniendo el mismo storage
   * @param loginResponse Nueva respuesta con tokens
   */
  private updateStoredTokens(loginResponse: LoginResponse): void {
    // Determinar qué storage se estaba usando
    const isUsingLocalStorage = localStorage.getItem(this.ACCESS_TOKEN_KEY) !== null;
    const storage = isUsingLocalStorage ? localStorage : sessionStorage;

    // Actualizar tokens
    storage.setItem(this.ACCESS_TOKEN_KEY, loginResponse.accessToken);
    storage.setItem(this.REFRESH_TOKEN_KEY, loginResponse.refreshToken);
    
    // Actualizar datos de usuario si vienen en la respuesta
    if (loginResponse.email && loginResponse.nombre) {
      storage.setItem(
        this.USER_DATA_KEY,
        JSON.stringify({
          email: loginResponse.email,
          fullName: loginResponse.nombre,
        })
      );
    }

    // Actualizar userRole siempre en localStorage si viene en la respuesta
    if (loginResponse.role) {
      localStorage.setItem("userRole", loginResponse.role);
    }
    
    // Actualizar timestamp de sesión
    this.updateSessionTimestamp();
  }

  /**
   * Renueva el access token usando el refresh token
   * @returns Observable con la nueva respuesta de tokens
   */
  public refreshAccessToken(): Observable<DataPackage<LoginResponse>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.log('❌ No hay refresh token disponible para renovar');
      return throwError(() => new Error('No refresh token available'));
    }

    console.log('🔄 Intentando renovar token...');
    const refreshPayload: RefreshTokenRequest = {
      refreshToken: refreshToken
    };

    return this.http
      .post<DataPackage<LoginResponse>>(
        `${this.API_BASE_URL}/refresh`,
        refreshPayload
      )
      .pipe(
        catchError((error) => {
          console.error('❌ Error en refresh token:', error);
          
          // Diferentes tipos de errores de refresh
          if (error.status === 401) {
            console.log('🚨 Refresh token inválido o expirado');
          } else if (error.status === 403) {
            console.log('🚨 Refresh token no autorizado');
          } else {
            console.log('🚨 Error de servidor en refresh');
          }
          
          return throwError(() => error);
        })
      );
  }

  /**
   * Inicializa la sincronización de sesiones entre pestañas
   */
  private initializeSessionSync(): void {
    // Verificar si ya existe una sesión activa en otra pestaña
    this.checkExistingSession();
    
    // Escuchar cambios en localStorage para sincronizar entre pestañas
    this.setupStorageListener();
  }

  /**
   * Verifica si ya existe una sesión activa en otra pestaña
   */
  private checkExistingSession(): void {
    const sessionTimestamp = localStorage.getItem(this.SESSION_TIMESTAMP_KEY);
    const currentTime = Date.now();
    
    if (sessionTimestamp) {
      const sessionTime = parseInt(sessionTimestamp);
      // Si la sesión es de hace menos de 1 hora
      if (currentTime - sessionTime < 3600000) {
        // Verificar si hay tokens válidos en cualquier storage
        const hasValidSession = this.hasValidTokensInAnyStorage();
        
        if (hasValidSession) {
          console.log('🔄 Sesión activa detectada en otra pestaña');
          this.authStateSubject.next(true);
          this.updateSessionTimestamp();
          return;
        }
      }
    }
    
    // Si llegamos aquí, verificar si esta pestaña ya tiene una sesión activa
    if (this.getToken() && !this.jwtHelper.isTokenExpired(this.getToken()!)) {
      console.log('🔄 Sesión válida en esta pestaña, actualizando timestamp');
      this.updateSessionTimestamp();
    }
  }

  /**
   * Verifica si hay tokens válidos en localStorage o sessionStorage
   */
  private hasValidTokensInAnyStorage(): boolean {
    // Verificar localStorage
    const localToken = localStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (localToken && !this.jwtHelper.isTokenExpired(localToken)) {
      return true;
    }
    
    // Verificar sessionStorage
    const sessionToken = sessionStorage.getItem(this.ACCESS_TOKEN_KEY);
    if (sessionToken && !this.jwtHelper.isTokenExpired(sessionToken)) {
      return true;
    }
    
    return false;
  }

  /**
   * Configura el listener para eventos de storage (cambios en otras pestañas)
   */
  private setupStorageListener(): void {
    if (typeof window !== 'undefined') {
      this.storageListener = (event: StorageEvent) => {
        if (event.key === this.SESSION_SYNC_KEY) {
          const syncData = event.newValue;
          if (syncData) {
            const data = JSON.parse(syncData);
            this.handleSessionSync(data);
          }
        } else if (event.key === this.ACCESS_TOKEN_KEY) {
          // Si se elimina el token en otra pestaña, cerrar sesión aquí también
          if (!event.newValue && this.isAuthenticated()) {
            console.log('🚪 Sesión cerrada en otra pestaña, cerrando aquí también');
            this.forceLogout();
          }
          // Si se agrega un token en otra pestaña, sincronizar
          else if (event.newValue && !this.isAuthenticated()) {
            console.log('🔑 Nueva sesión detectada en otra pestaña');
            this.authStateSubject.next(true);
            this.updateSessionTimestamp();
          }
        }
      };
      
      window.addEventListener('storage', this.storageListener);
    }
  }

  /**
   * Maneja la sincronización cuando se recibe un evento de otra pestaña
   */
  private handleSessionSync(data: any): void {
    switch (data.action) {
      case 'login':
        // Al recibir notificación de login en otra pestaña
        console.log('🔄 Nueva sesión detectada en otra pestaña');
        
        // Si esta pestaña no tiene sesión, mostrar notificación
        if (!this.hasValidTokensInAnyStorage()) {
          this.modalService.alert(
            'Sesión Iniciada en Otra Pestaña',
            'Se ha detectado un inicio de sesión en otra pestaña. Esta pestaña se mantendrá en la página de login.'
          );
        }
        // Si esta pestaña tiene tokens en sessionStorage, forzar logout
        else if (sessionStorage.getItem(this.ACCESS_TOKEN_KEY)) {
          console.log('� Forzando logout por nueva sesión en otra pestaña');
          this.modalService.alert(
            'Nueva Sesión Detectada',
            'Se ha iniciado una nueva sesión en otra pestaña. Su sesión actual será cerrada.'
          );
          setTimeout(() => this.forceLogoutPreservingNewSession(data.data), 2000);
        }
        break;
        
      case 'logout':
        if (this.isAuthenticated()) {
          console.log('🔄 Sincronizando logout desde otra pestaña');
          this.forceLogout();
        }
        break;
        
      case 'token_refresh':
        // Solo sincronizar si los tokens están en localStorage
        if (localStorage.getItem(this.ACCESS_TOKEN_KEY)) {
          console.log('🔄 Token actualizado en otra pestaña');
          this.authStateSubject.next(true);
        }
        break;
    }
  }

  /**
   * Actualiza el timestamp de la sesión
   */
  private updateSessionTimestamp(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_TIMESTAMP_KEY, Date.now().toString());
    }
  }

  /**
   * Inicia un timer periódico para actualizar el timestamp cuando hay sesiones en sessionStorage
   */
  private startPeriodicTimestampUpdate(): void {
    if (typeof window !== 'undefined') {
      // Actualizar timestamp cada 5 minutos si hay una sesión activa
      this.timestampUpdateTimer = setInterval(() => {
        if (this.hasValidTokensInAnyStorage()) {
          this.updateSessionTimestamp();
        }
      }, 300000); // 5 minutos
    }
  }

  /**
   * Notifica a otras pestañas sobre cambios de sesión
   */
  private notifyOtherTabs(action: string, data?: any): void {
    if (typeof window !== 'undefined') {
      const syncData = {
        action,
        timestamp: Date.now(),
        data: data || null
      };
      
      localStorage.setItem(this.SESSION_SYNC_KEY, JSON.stringify(syncData));
      // Eliminar inmediatamente para permitir múltiples notificaciones
      setTimeout(() => {
        localStorage.removeItem(this.SESSION_SYNC_KEY);
      }, 100);
    }
  }

  /**
   * Fuerza el cierre de sesión sin notificar a otras pestañas
   */
  private forceLogout(): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    this.clearAllStorageData();
    this.authStateSubject.next(false);
    
    // Redirigir a login si no estamos ya ahí
    if (this.router.url !== '/ingresar') {
      this.router.navigate(['/ingresar']);
    }
  }

  /**
   * Fuerza el cierre de sesión sin tocar localStorage (para preservar nueva sesión)
   * @param newSessionData Datos de la nueva sesión (no se usa pero se mantiene por compatibilidad)
   */
  private forceLogoutPreservingNewSession(newSessionData?: any): void {
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
    
    // NO limpiar localStorage - solo limpiar sessionStorage de esta pestaña
    // para evitar borrar los datos de la nueva sesión
    const sessionKeys = [
      this.ACCESS_TOKEN_KEY,
      this.REFRESH_TOKEN_KEY,
      this.USER_DATA_KEY,
      "userRole",
      "userId",
      "userName",
      "userEmail",
      "id",
      "currentUser",
      "pacienteId",
      "patientData",
      "patientDNI",
      "medicoId",
      "medicoData",
      "medicoMatricula",
      "especialidadId",
      "staffMedicoId",
      "notificacionesMedico",
      "operadorId",
      "operadorData",
      "operadorDNI",
      "centroAsignado",
      "adminId",
      "adminData",
      "permissions"
    ];
    
    // Solo limpiar sessionStorage (no localStorage) 
    sessionKeys.forEach((key) => {
      sessionStorage.removeItem(key);
    });
    
    this.authStateSubject.next(false);
    
    // Redirigir a login si no estamos ya ahí
    if (this.router.url !== '/ingresar') {
      this.router.navigate(['/ingresar']);
    }
  }

  /**
   * Cleanup al destruir el servicio
   */
  ngOnDestroy(): void {
    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
    }
    
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    
    if (this.timestampUpdateTimer) {
      clearInterval(this.timestampUpdateTimer);
    }
  }
}
