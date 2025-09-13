import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../inicio-sesion/auth.service';

/**
 * Interceptor HTTP que maneja automáticamente errores de autenticación
 * y token expirado en todas las peticiones HTTP
 */
export const authErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Si es un error 401 o 403, usar el manejador centralizado de AuthService
      if (error.status === 401 || error.status === 403) {
        // Determinar mensaje específico basado en la respuesta del servidor
        let customMessage: string | undefined;
        
        if (error.status === 401) {
          if (error.error?.message?.includes('expired') || error.error?.message?.includes('invalid')) {
            customMessage = 'Su sesión ha expirado. Por favor, inicie sesión nuevamente.';
          } else {
            customMessage = 'Credenciales inválidas. Por favor, verifique sus datos e inicie sesión nuevamente.';
          }
        } else if (error.status === 403) {
          customMessage = 'No tiene permisos para realizar esta acción. Su sesión será renovada.';
        }

        // Usar el manejador centralizado
        authService.handleAuthError(error, customMessage);
      }

      // Re-lanzar el error para que los componentes puedan manejarlo si es necesario
      return throwError(() => error);
    })
  );
};