import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { OfflineCacheService } from '../services/offline-cache.service';
import { OfflineStatusService } from '../services/offline-status.service';

// URLs que devem ser cacheadas para funcionamento offline
const CACHEABLE_PATTERNS = [
  '/api/abp/application-configuration',
  '/.well-known/openid-configuration',
  '/.well-known/jwks',
  '/connect/userinfo',
  '/api/abp/application-localization',
  '/api/abp/multi-tenancy/tenants',
  '/api/feature-management/',
  '/api/permission-management/',
  '/api/setting-management/',
];

// URLs que são críticas e precisam de fallback mesmo sem cache
const CRITICAL_PATTERNS = [
  '/.well-known/openid-configuration',
  '/.well-known/jwks',
  '/api/abp/application-configuration',
  '/api/abp/application-localization',
  '/connect/userinfo',
  '/api/abp/multi-tenancy/tenants',
];

/**
 * Verifica se a URL deve ser cacheada
 */
function shouldCache(url: string): boolean {
  return CACHEABLE_PATTERNS.some(pattern => url.includes(pattern));
}

/**
 * Verifica se a URL é crítica (precisa de fallback)
 */
function isCritical(url: string): boolean {
  return CRITICAL_PATTERNS.some(pattern => url.includes(pattern));
}

/**
 * Verifica se é um erro de rede (offline)
 */
function isNetworkError(error: HttpErrorResponse): boolean {
  return error.status === 0 || error.status === 504 || !navigator.onLine;
}

/**
 * Interceptor que fornece fallback offline para requisições HTTP
 */
export const offlineFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(OfflineCacheService);
  const offlineStatus = inject(OfflineStatusService);

  const cacheKey = req.method + ':' + req.urlWithParams;

  // Apenas intercepta requisições GET para cache
  if (req.method !== 'GET') {
    return next(req);
  }

  // Se estiver offline e tiver cache, retorna direto do cache
  if (offlineStatus.isOffline() && shouldCache(req.url)) {
    const cachedData = cacheService.get<unknown>(cacheKey);
    if (cachedData) {
      console.log('[Offline] Serving from cache:', req.url);
      return of(new HttpResponse({
        body: cachedData,
        status: 200,
        statusText: 'OK (Cached)',
        url: req.url,
      }));
    }

    // Se não tem cache mas é crítica, retorna fallback
    if (isCritical(req.url)) {
      const fallbackData = getDefaultFallback(req.url);
      if (fallbackData) {
        console.log('[Offline] Serving fallback:', req.url);
        return of(new HttpResponse({
          body: fallbackData,
          status: 200,
          statusText: 'OK (Fallback)',
          url: req.url,
        }));
      }
    }
  }

  return next(req).pipe(
    // Quando a requisição for bem-sucedida, armazena no cache
    tap(event => {
      if (event instanceof HttpResponse && shouldCache(req.url)) {
        cacheService.set(cacheKey, event.body);
      }
    }),

    // Quando houver erro, tenta retornar do cache
    catchError((error: HttpErrorResponse) => {
      // Para qualquer URL cacheável ou crítica com erro de rede
      if (isNetworkError(error)) {
        // Primeiro tenta o cache
        if (shouldCache(req.url) || isCritical(req.url)) {
          const cachedData = cacheService.get<unknown>(cacheKey);

          if (cachedData) {
            console.log('[Offline Fallback] Serving from cache:', req.url);
            return of(new HttpResponse({
              body: cachedData,
              status: 200,
              statusText: 'OK (Offline Cache)',
              url: req.url,
            }));
          }
        }

        // Se não tem cache, tenta fallback padrão para URLs críticas
        if (isCritical(req.url)) {
          const fallbackData = getDefaultFallback(req.url);
          if (fallbackData) {
            console.log('[Offline Fallback] Serving default config:', req.url);
            return of(new HttpResponse({
              body: fallbackData,
              status: 200,
              statusText: 'OK (Default Fallback)',
              url: req.url,
            }));
          }
        }

        // Para URLs silenciosas sem cache/fallback, retorna resposta vazia para não propagar erro
        if (shouldCache(req.url)) {
          console.log('[Offline Fallback] Returning empty response for:', req.url);
          return of(new HttpResponse({
            body: {},
            status: 200,
            statusText: 'OK (Empty Fallback)',
            url: req.url,
          }));
        }
      }

      return throwError(() => error);
    })
  );
};

/**
 * Verifica se há um token OAuth válido salvo localmente
 */
function hasValidLocalToken(): boolean {
  try {
    const accessToken = localStorage.getItem('access_token') ||
                        sessionStorage.getItem('access_token');
    if (!accessToken) return false;

    // Verifica se o token não expirou (se possível decodificar)
    const expiresAt = localStorage.getItem('expires_at') ||
                      sessionStorage.getItem('expires_at');
    if (expiresAt) {
      const expiryTime = parseInt(expiresAt, 10);
      if (expiryTime < Date.now()) return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Tenta extrair informações do usuário do id_token salvo
 */
function getUserInfoFromToken(): { name?: string; email?: string; sub?: string } | null {
  try {
    const idToken = localStorage.getItem('id_token') ||
                    sessionStorage.getItem('id_token');
    if (!idToken) return null;

    // Decodifica a parte payload do JWT (base64)
    const parts = idToken.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return {
      name: payload.name || payload.preferred_username,
      email: payload.email,
      sub: payload.sub,
    };
  } catch {
    return null;
  }
}

/**
 * Retorna configuração padrão para URLs críticas quando não há cache
 */
function getDefaultFallback(url: string): unknown | null {
  // OpenID Configuration fallback
  if (url.includes('/.well-known/openid-configuration') && !url.includes('/jwks')) {
    const baseUrl = new URL(url).origin;
    return {
      issuer: baseUrl,
      authorization_endpoint: `${baseUrl}/connect/authorize`,
      token_endpoint: `${baseUrl}/connect/token`,
      userinfo_endpoint: `${baseUrl}/connect/userinfo`,
      end_session_endpoint: `${baseUrl}/connect/endsession`,
      jwks_uri: `${baseUrl}/.well-known/jwks`,
      scopes_supported: ['openid', 'profile', 'email', 'offline_access'],
      response_types_supported: ['code', 'token', 'id_token', 'code token', 'code id_token'],
      grant_types_supported: ['authorization_code', 'client_credentials', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: ['RS256'],
      code_challenge_methods_supported: ['plain', 'S256'],
    };
  }

  // JWKS (JSON Web Key Set) fallback - retorna array vazio de chaves
  // Isso permite que o app funcione offline com tokens já validados anteriormente
  if (url.includes('/.well-known/jwks') || url.includes('/jwks')) {
    return {
      keys: []
    };
  }

  // User Info fallback
  if (url.includes('/connect/userinfo')) {
    const userInfo = getUserInfoFromToken();
    if (userInfo) {
      return {
        sub: userInfo.sub,
        name: userInfo.name,
        email: userInfo.email,
      };
    }
    return {};
  }

  // Multi-tenancy tenants fallback
  if (url.includes('/api/abp/multi-tenancy/tenants')) {
    return {
      tenants: []
    };
  }

  // ABP Application Configuration fallback
  if (url.includes('/api/abp/application-configuration')) {
    const hasToken = hasValidLocalToken();
    const userInfo = hasToken ? getUserInfoFromToken() : null;

    return {
      localization: {
        currentCulture: {
          cultureName: 'en',
          displayName: 'English',
          name: 'en',
        },
        languages: [{ cultureName: 'en', displayName: 'English', uiCultureName: 'en' }],
        values: {},
      },
      auth: {
        policies: {},
        grantedPolicies: {},
      },
      setting: {
        values: {},
      },
      currentUser: {
        isAuthenticated: hasToken,
        id: userInfo?.sub || null,
        tenantId: null,
        userName: userInfo?.name || null,
        name: userInfo?.name || null,
        surName: null,
        email: userInfo?.email || null,
        emailVerified: false,
        phoneNumber: null,
        phoneNumberVerified: false,
        roles: [],
      },
      features: {
        values: {},
      },
      globalFeatures: {
        enabledFeatures: [],
      },
      multiTenancy: {
        isEnabled: false,
      },
      currentTenant: {
        id: null,
        name: null,
        isAvailable: false,
      },
      timing: {
        timeZone: {
          iana: { timeZoneName: 'UTC' },
          windows: { timeZoneId: 'UTC' },
        },
      },
      clock: {
        kind: 'Utc',
      },
      objectExtensions: {
        modules: {},
        enums: {},
      },
      extraProperties: {},
    };
  }

  // ABP Application Localization fallback
  if (url.includes('/api/abp/application-localization')) {
    return {
      resources: {},
    };
  }

  return null;
}
