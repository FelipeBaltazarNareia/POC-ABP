import { HttpInterceptorFn, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { of, throwError } from 'rxjs';
import { OfflineCacheService } from '../services/offline-cache.service';
import { OfflineStatusService } from '../services/offline-status.service';

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

const CRITICAL_PATTERNS = [
  '/.well-known/openid-configuration',
  '/.well-known/jwks',
  '/api/abp/application-configuration',
  '/api/abp/application-localization',
  '/connect/userinfo',
  '/api/abp/multi-tenancy/tenants',
];

function shouldCache(url: string): boolean {
  return CACHEABLE_PATTERNS.some(pattern => url.includes(pattern));
}

function isCritical(url: string): boolean {
  return CRITICAL_PATTERNS.some(pattern => url.includes(pattern));
}

function isNetworkError(error: HttpErrorResponse): boolean {
  return error.status === 0 || error.status === 504 || !navigator.onLine;
}

export const offlineFallbackInterceptor: HttpInterceptorFn = (req, next) => {
  const cacheService = inject(OfflineCacheService);
  const offlineStatus = inject(OfflineStatusService);

  const cacheKey = req.method + ':' + req.urlWithParams;

  if (req.method !== 'GET') {
    return next(req);
  }

  if (offlineStatus.isOffline() && shouldCache(req.url)) {
    const cachedData = cacheService.get<unknown>(cacheKey);
    if (cachedData) {
      return of(new HttpResponse({
        body: cachedData,
        status: 200,
        statusText: 'OK (Cached)',
        url: req.url,
      }));
    }

    if (isCritical(req.url)) {
      const fallbackData = getDefaultFallback(req.url);
      if (fallbackData) {
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
    tap(event => {
      if (event instanceof HttpResponse && shouldCache(req.url)) {
        cacheService.set(cacheKey, event.body);
      }
    }),

    catchError((error: HttpErrorResponse) => {
      if (isNetworkError(error)) {
        if (shouldCache(req.url) || isCritical(req.url)) {
          const cachedData = cacheService.get<unknown>(cacheKey);

          if (cachedData) {
            return of(new HttpResponse({
              body: cachedData,
              status: 200,
              statusText: 'OK (Offline Cache)',
              url: req.url,
            }));
          }
        }

        if (isCritical(req.url)) {
          const fallbackData = getDefaultFallback(req.url);
          if (fallbackData) {
            return of(new HttpResponse({
              body: fallbackData,
              status: 200,
              statusText: 'OK (Default Fallback)',
              url: req.url,
            }));
          }
        }

        if (shouldCache(req.url)) {
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

function hasValidLocalToken(): boolean {
  try {
    const accessToken = localStorage.getItem('access_token') ||
                        sessionStorage.getItem('access_token');
    if (!accessToken) return false;

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

function getUserInfoFromToken(): { name?: string; email?: string; sub?: string } | null {
  try {
    const idToken = localStorage.getItem('id_token') ||
                    sessionStorage.getItem('id_token');
    if (!idToken) return null;

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

function getDefaultFallback(url: string): unknown | null {
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

  if (url.includes('/.well-known/jwks') || url.includes('/jwks')) {
    return {
      keys: []
    };
  }

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

  if (url.includes('/api/abp/multi-tenancy/tenants')) {
    return {
      tenants: []
    };
  }

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

  if (url.includes('/api/abp/application-localization')) {
    return {
      resources: {},
    };
  }

  return null;
}
