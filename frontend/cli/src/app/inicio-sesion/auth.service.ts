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

  constructor(
    private http: HttpClient,
    private router: Router,
    private pacienteService: PacienteService
  ) {}

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
  }

  /**
   * Almacena los tokens en el storage apropiado
   * @param loginResponse Respuesta del login
   * @param rememberMe Si debe usar localStorage o sessionStorage
   */
  private storeTokens(loginResponse: LoginResponse, rememberMe: boolean): void {
    // Limpiar datos de usuario anterior antes de almacenar los nuevos
    this.clearPreviousUserData();

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
   * Limpia datos de usuario anterior para evitar conflictos
   */
  private clearPreviousUserData(): void {
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
    return token !== null && !this.jwtHelper.isTokenExpired(token);
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
    // Limpiar todos los datos de usuario (incluyendo tokens JWT)
    this.clearPreviousUserData();

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
}
