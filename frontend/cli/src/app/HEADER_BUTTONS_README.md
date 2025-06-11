# Botones de Encabezado con Animaciones Avanzadas

Este archivo documenta las clases CSS globales para botones de encabezado con efectos de animación avanzados.

## Clases Disponibles

### Botones Base

#### `.btn-header-glass`
Botón con efecto de vidrio, ideal para usar sobre fondos con gradiente.
- Fondo semitransparente con blur
- Efecto de brillo deslizante al hacer hover
- Transformación con escala y elevación

```html
<button class="btn btn-header-glass" (click)="goBack()">
  <i class="fas fa-arrow-left"></i>
  Volver
</button>
```

#### `.btn-header-solid`
Botón sólido con gradiente del tema principal.
- Fondo con gradiente azul-púrpura
- Efecto de brillo deslizante
- Transformación y sombras mejoradas

```html
<button class="btn btn-header-solid" (click)="addNew()">
  <i class="fas fa-plus"></i>
  Agregar Nuevo
</button>
```

### Variantes de Color

#### `.btn-header-success`
Botón verde para acciones positivas
```html
<button class="btn btn-header-solid btn-header-success" (click)="save()">
  <i class="fas fa-check"></i>
  Guardar
</button>
```

#### `.btn-header-danger`
Botón rojo para acciones destructivas
```html
<button class="btn btn-header-solid btn-header-danger" (click)="delete()">
  <i class="fas fa-trash"></i>
  Eliminar
</button>
```

#### `.btn-header-warning`
Botón amarillo/naranja para advertencias
```html
<button class="btn btn-header-solid btn-header-warning" (click)="warn()">
  <i class="fas fa-exclamation"></i>
  Advertencia
</button>
```

### Tamaños

#### `.btn-header-sm`
Botón pequeño
```html
<button class="btn btn-header-glass btn-header-sm">
  Pequeño
</button>
```

#### `.btn-header-lg`
Botón grande
```html
<button class="btn btn-header-solid btn-header-lg">
  Grande
</button>
```

## Efectos Incluidos

1. **Transición suave**: `transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)`
2. **Efecto de brillo**: Pseudoelemento `::before` que se desliza de izquierda a derecha
3. **Transformación 3D**: `translateY(-3px) scale(1.05)` al hacer hover
4. **Sombras dinámicas**: Sombras que se intensifican en hover
5. **Blur backdrop**: `backdrop-filter: blur(10px)` para el efecto vidrio

## Cuándo Usar Cada Tipo

### `.btn-header-glass`
- Botones sobre fondos con gradiente
- Headers con imágenes de fondo
- Cuando quieres mantener la visibilidad del fondo
- Botones de navegación (Volver, Siguiente, Anterior)

### `.btn-header-solid`
- Acciones principales (Agregar, Guardar, Crear)
- Cuando quieres que el botón destaque
- CTAs (Call to Action) importantes
- Sobre fondos claros o neutros

## Responsive Design

Los botones se adaptan automáticamente en pantallas móviles:
- Padding reducido en móviles
- Tamaño de fuente ajustado
- Los botones grandes se reducen apropiadamente

## Compatibilidad

- Todos los navegadores modernos
- Soporte para `backdrop-filter` requerido para efecto vidrio completo
- Fallback gracioso en navegadores sin soporte

## Ejemplos de Uso en Componentes

```typescript
// En el template HTML
template: `
  <div class="header-actions">
    <button class="btn btn-header-glass" (click)="goBack()">
      <i class="fas fa-arrow-left"></i>
      Volver
    </button>
    
    <button class="btn btn-header-solid" (click)="addNew()">
      <i class="fas fa-plus"></i>
      Agregar Nuevo
    </button>
  </div>
`
```

## Personalización

Si necesitas personalizar los colores o efectos para un componente específico, puedes sobrescribir las variables CSS o crear variantes adicionales basadas en estas clases base.
