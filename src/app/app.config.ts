import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling, withViewTransitions } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { tokenInterceptor } from './core/interceptors/token.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';
import { MessageService } from 'primeng/api';
import { environment } from '../environments/environment';
import { LocalServicesModule } from './core/services/local-services.module';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }),
      withEnabledBlockingInitialNavigation(),
      withViewTransitions()),
    provideHttpClient(withFetch(), withInterceptors([errorInterceptor, tokenInterceptor, loadingInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
    // Proporcionar MessageService a nivel de aplicación para que esté disponible en todos los componentes
    MessageService,
    // Importar el módulo de servicios locales si useLocalData es true
    ...(environment.useLocalData ? [importProvidersFrom(LocalServicesModule)] : [])
  ]
};
