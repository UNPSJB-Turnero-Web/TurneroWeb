# Sistema de Gestión de Tokens JWT - TurneroWeb

## Descripción

Este documento describe el sistema completo de gestión de tokens JWT implementado en TurneroWeb, incluyendo renovación automática, manejo de expiración y notificaciones al usuario.

## Arquitectura del Sistema

### Componentes Principales

1. **AuthService**: Servicio centralizado de autenticación
2. **AuthErrorInterceptor**: Interceptor HTTP para manejo automático de errores
3. **ModalService**: Servicio para mostrar notificaciones al usuario
4. **TokenStatusComponent**: Componente de debugging (opcional)

### Flujo de Token

```
Usuario inicia sesión → Recibe access_token (15 min) + refresh_token (7 días)
                    ↓
            Sistema programa renovación automática (13 min)
                    ↓
            Token se renueva automáticamente
                    ↓
            Si falla renovación → Notifica al usuario → Limpia datos → Redirige al login
```

## Configuración Backend

### Configuración de Tokens (application.properties)

```properties
# JWT Configuration
jwt.secret=tu_secret_key_aqui
jwt.access-token.expiration=900000    # 15 minutos en milisegundos
jwt.refresh-token.expiration=604800000 # 7 días en milisegundos
```

### Endpoints Required

- `POST /auth/login` - Login inicial
- `POST /auth/refresh` - Renovación de token
- `POST /auth/logout` - Logout (opcional)

## Configuración Frontend

### 1. Configuración de Interceptors (app.config.ts)

```typescript
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authErrorInterceptor } from './interceptors/auth-error.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // ... otros providers
    provideHttpClient(withInterceptors([authErrorInterceptor])),
  ]
};
```

### 2. Inicialización del Sistema

El sistema se inicializa automáticamente cuando el usuario inicia sesión. No requiere configuración adicional.

## Uso en Componentes

### Verificar Estado de Autenticación

```typescript
constructor(private authService: AuthService) {}

ngOnInit() {
  if (this.authService.isAuthenticated()) {
    // Usuario autenticado
    const userInfo = this.authService.getCurrentUser();
  }
}
```

### Manejar Errores de Autenticación Manualmente

```typescript
// El interceptor maneja automáticamente los errores 401/403
// Pero si necesitas manejo personalizado:

this.someService.someMethod().subscribe({
  next: (data) => { /* manejo exitoso */ },
  error: (error) => {
    if (error.status === 401) {
      this.authService.handleAuthError(error, 'Mensaje personalizado');
    }
  }
});
```

### Verificar Estado del Token (para debugging)

```typescript
// Obtener información detallada del token
const tokenInfo = this.authService.getTokenInfo();
console.log('Token info:', tokenInfo);

// Verificar si el token está próximo a expirar
if (this.authService.isTokenExpiringSoon()) {
  console.log('Token expira pronto');
}
```

## Funcionalidades Implementadas

### ✅ Renovación Automática
- Los tokens se renuevan automáticamente 2 minutos antes de expirar
- No requiere intervención del usuario
- Funciona en segundo plano

### ✅ Manejo de Errores
- Interceptor HTTP automático para errores 401/403
- Notificaciones claras al usuario
- Limpieza completa de datos de sesión

### ✅ Limpieza de Datos
- Limpia localStorage y sessionStorage
- Remueve tokens y datos del usuario
- Resetea estado de la aplicación

### ✅ Notificaciones al Usuario
- Modal informativo cuando la sesión expira
- Mensajes personalizados según el tipo de error
- Redirección automática al login

### ✅ Debugging y Monitoreo
- Componente TokenStatusComponent para desarrollo
- Logs detallados en consola
- Información de estado del token

## Componente de Debug (Opcional)

Para habilitar el componente de debugging de tokens:

```typescript
// En cualquier componente donde quieras ver el estado del token
import { TokenStatusComponent } from './components/token-status.component';

@Component({
  // ...
  imports: [TokenStatusComponent],
  template: `
    <app-token-status></app-token-status>
    <!-- resto del template -->
  `
})
```

O habilitar globalmente:
```javascript
// En localStorage del navegador (desarrollo)
localStorage.setItem('show-token-debug', 'true');
```

## Personalización

### Modificar Tiempo de Renovación

En `AuthService.scheduleTokenRefresh()`:

```typescript
// Cambiar de 2 minutos antes a otro valor
const refreshTime = tokenLifetime - (3 * 60 * 1000); // 3 minutos antes
```

### Personalizar Mensajes de Error

En `AuthService.handleTokenExpired()`:

```typescript
private handleTokenExpired(customMessage?: string): void {
  const message = customMessage || 'Tu mensaje personalizado aquí';
  // ...
}
```

### Agregar Logging Personalizado

```typescript
// En cualquier parte del AuthService
private logTokenEvent(event: string, details?: any): void {
  console.log(`[TOKEN] ${event}:`, details);
  // Aquí puedes agregar logging a servicios externos
}
```

## Troubleshooting

### Problema: Tokens no se renuevan
- Verificar que el endpoint `/auth/refresh` esté funcionando
- Revisar que los refresh tokens se guarden correctamente
- Comprobar logs en consola del navegador

### Problema: Usuario no recibe notificaciones
- Verificar que ModalService esté importado correctamente
- Revisar que NgBootstrap esté configurado
- Comprobar que no hay errores en consola

### Problema: Datos no se limpian
- Verificar que `clearAllStorageData()` se ejecute
- Revisar que no hay referencias cached a datos del usuario
- Comprobar que la navegación funcione correctamente

## Logs Útiles

Para debugging, buscar en consola:
- `[AUTH] Token renovado exitosamente`
- `[AUTH] Error renovando token`
- `[AUTH] Programando renovación en`
- `[AUTH] Usuario notificado de expiración`

## Consideraciones de Seguridad

1. **Refresh Tokens**: Se almacenan en localStorage (considera httpOnly cookies para mayor seguridad)
2. **Limpieza**: Todos los datos se limpian al cerrar sesión o expirar
3. **Logs**: No registres tokens completos en logs de producción
4. **HTTPS**: Asegúrate de usar HTTPS en producción

## Próximas Mejoras

- [ ] Migrar refresh tokens a httpOnly cookies
- [ ] Implementar blacklist de tokens en backend
- [ ] Agregar métricas de renovación de tokens
- [ ] Implementar remember me con tokens de mayor duración