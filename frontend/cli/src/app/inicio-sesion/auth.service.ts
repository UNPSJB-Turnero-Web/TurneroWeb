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

  private jwtHelper = new JwtHelperService();
  private authStateSubject = new BehaviorSubject<boolean>(
    this.isAuthenticated()
  );
  public authState$ = this.authStateSubject.asObservable();

  private tokenRefreshTimer: any = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private pacienteService: PacienteService,
    private modalService: ModalService
  ) {
    // Inicializar el auto-refresh si hay un token válido
    this.initializeTokenRefresh();
  }

  /**
   * Realiza el login del usuario
   * @param loginData Datos de login con email, password y rememberMe
   * @returns Observable con la respuesta del backend
   */
  login(loginData: LoginData): Observable<DataPackage<LoginResponse>> {
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

    // Combinar todas las claves que pueden existir
    const allKeys = [
      ...tokenKeys,
      ...commonKeys,
      ...pacienteKeys,
      ...medicoKeys,
      ...operadorKeys,
      ...adminKeys,
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
        this.router.navigate(["/turnos"]);
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
    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Authorization: `Bearer ${this.getToken()}`,
    });

    return this.http
      .post<DataPackage<any>>(`${this.API_BASE_URL}/change-password`, request, {
        headers,
      })
      .pipe(catchError(this.handleError));
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
}
