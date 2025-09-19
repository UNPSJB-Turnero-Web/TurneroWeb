
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

/**
 * Interceptor HTTP que agrega el header Authorization con el JWT a todas las requests salientes
 * excepto login y registro. Compatible con Angular 16+ (HttpInterceptorFn)
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.includes('/login') || req.url.includes('/register')) {
    return next(req);
  }
  // Buscar el token en los nombres más comunes
  const token =
    localStorage.getItem('access_token') ||
    sessionStorage.getItem('access_token') ||
    localStorage.getItem('jwt') ||
    sessionStorage.getItem('jwt') ||
    localStorage.getItem('token') ||
    sessionStorage.getItem('token');
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => throwError(() => error))
    );
  }
  return next(req);
};
