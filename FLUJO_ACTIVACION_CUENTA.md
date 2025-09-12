# Flujo de Activación de Cuenta - TurneroWeb

## Descripción
Este documento explica el nuevo flujo de activación de cuenta implementado en TurneroWeb.

## Flujo Completo

### 1. Registro de Usuario
- El usuario se registra en `/registro-usuario`
- El backend crea la cuenta pero NO la activa inmediatamente
- Se envía un email de activación automáticamente
- Se muestra mensaje: "Usuario registrado exitosamente. Revisa tu email para activar tu cuenta."

### 2. Email de Activación
- El usuario recibe un email con un enlace como:
  ```
  http://localhost:4200/activate-account?token=mFtnQ2an8Ndaj2Mc4esGLrMcbsFT3y1Q6DFIUTXn5ZB2BHRCfDG0KWkVxvb44GGp
  ```

### 3. Activación Automática
- Al hacer clic en el enlace, se carga `/activate-account`
- El componente `ActivacionCuentaComponent` extrae automáticamente el token de la URL
- Se envía el token al backend endpoint `POST /api/auth/activate-account`
- El backend activa la cuenta y devuelve confirmación

### 4. Página de Confirmación
- **Caso Exitoso**: Muestra mensaje "¡Cuenta Activada Exitosamente!" con botón "Iniciar Sesión"
- **Caso Error**: Muestra el error específico con sugerencias y botón "Solicitar Nuevo Enlace"

## Componentes Implementados

### Frontend
- **`ActivacionCuentaComponent`**: Maneja la UI de activación
- **`ActivacionCuentaService`**: Servicio para comunicarse con el backend
- **Ruta**: `/activate-account` agregada a `app.routes.ts`

### Backend (ya existía)
- **`AuthController.activateAccount()`**: Endpoint POST `/api/auth/activate-account`
- **`AccountActivationService`**: Lógica de activación y envío de emails

## Estructura de Respuestas

### Registro Exitoso (Backend → Frontend)
```json
{
  "status_code": 200,
  "status_text": "Usuario registrado exitosamente. Revisa tu email para activar tu cuenta.",
  "data": {
    "email": "usuario@email.com",
    "fullName": "Usuario Nombre",
    "activationMessage": "Se ha enviado un enlace de activación a tu email"
  }
}
```

### Activación Exitosa (Backend → Frontend)
```json
{
  "status_code": 200,
  "status_text": "Cuenta activada exitosamente. Ya puedes iniciar sesión.",
  "data": null
}
```

## Estados de Activación

### Loading State
- Spinner con mensaje "Activando tu cuenta, por favor espera..."

### Success State
- Ícono de check verde
- Mensaje de éxito
- Botón "Iniciar Sesión"

### Error State
- Ícono de error
- Mensaje específico del error
- Sugerencias para resolverlo
- Botones "Solicitar Nuevo Enlace" e "Ir a Iniciar Sesión"

## Casos de Error Manejados

- **400**: Token inválido o expirado
- **404**: Cuenta no encontrada
- **409**: Cuenta ya activada
- **500**: Error interno del servidor

## Notas Técnicas

1. **Auto-login removido**: El registro ya NO hace auto-login, requiere activación primero
2. **Token extraction**: Se obtiene automáticamente de `?token=` en la URL
3. **Proxy configuration**: Las llamadas a `/rest/*` se redirigen al backend vía proxy
4. **Responsive design**: La página funciona correctamente en móviles
5. **Animaciones**: Incluye animaciones suaves para mejor UX

## Testing

Para probar el flujo:

1. Registrar un nuevo usuario
2. Verificar que se muestre el mensaje de activación (sin auto-login)
3. Simular clic en enlace de activación accediendo a:
   ```
   http://localhost:4200/activate-account?token=TOKEN_DEL_EMAIL
   ```
4. Verificar que se active correctamente y muestre la página de éxito