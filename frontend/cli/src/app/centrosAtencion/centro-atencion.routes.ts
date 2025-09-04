// Ejemplo de configuración de rutas para usar el componente refactorizado

import { Routes } from '@angular/router';
import { CentroAtencionDetailRefactoredComponent } from './centroAtencion-detail-refactored.component';

export const centroAtencionRoutes: Routes = [
  {
    path: 'centros-atencion/:id',
    component: CentroAtencionDetailRefactoredComponent,
    data: { title: 'Detalle del Centro de Atención' }
  },
  {
    path: 'centros-atencion/new',
    component: CentroAtencionDetailRefactoredComponent,
    data: { title: 'Nuevo Centro de Atención' }
  }
];

// Para agregar a app.routes.ts o al módulo principal:
/*
import { centroAtencionRoutes } from './centrosAtencion/centro-atencion.routes';

export const routes: Routes = [
  ...centroAtencionRoutes,
  // otras rutas
];
*/
