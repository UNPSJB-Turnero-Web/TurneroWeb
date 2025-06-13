import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { CalendarUtils, DateAdapter, CalendarA11y, CalendarDateFormatter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { I18nPluralPipe, registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';

// Registrar locale español
registerLocaleData(localeEs);

bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    ...(appConfig.providers || []),
    { provide: CalendarUtils, useClass: CalendarUtils },
    { provide: DateAdapter, useFactory: adapterFactory },
    { provide: CalendarA11y, useClass: CalendarA11y },
    { provide: CalendarDateFormatter, useClass: CalendarDateFormatter },
    I18nPluralPipe
  ]
})
  .catch((err) => console.error(err));

  