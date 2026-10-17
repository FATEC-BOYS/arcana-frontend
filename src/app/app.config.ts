import { ApplicationConfig } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';
import { API_BASE_URL } from './core/config/api-config';
export const appConfig: ApplicationConfig = { providers: [
  provideRouter(routes, withInMemoryScrolling({scrollPositionRestoration: 'enabled'})),
  provideHttpClient(), { provide: API_BASE_URL, useValue: '/api/v1' }
] };
