import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { I18nPluralPipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registrar locale español
registerLocaleData(localeEs);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    
  ]
})
  .catch((err) => console.error(err));

  