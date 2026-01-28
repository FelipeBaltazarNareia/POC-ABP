import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { OfflineStatusService } from '../services/offline-status.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private ngZone = inject(NgZone);
  private offlineStatus = inject(OfflineStatusService);

  private readonly silentUrls = [
    '/.well-known/openid-configuration',
    '/.well-known/jwks',
    '/connect/userinfo',
    '/connect/token',
    '/connect/authorize',
    '/api/abp/application-configuration',
    '/api/abp/application-localization',
    '/api/abp/multi-tenancy/tenants',
    '/api/feature-management/',
    '/api/permission-management/',
    '/api/setting-management/',
  ];

  handleError(error: unknown): void {
    this.ngZone.runOutsideAngular(() => {
      if (error instanceof HttpErrorResponse) {
        this.handleHttpError(error);
        return;
      }

      if (this.isHttpErrorWrapper(error)) {
        const httpError = this.extractHttpError(error);
        if (httpError) {
          this.handleHttpError(httpError);
          return;
        }
      }
    });
  }

  private handleHttpError(error: HttpErrorResponse): void {
    const isSilent = this.silentUrls.some(url => error.url?.includes(url));

    if (error.status === 0) {
      if (isSilent) {
        return;
      }

      if (!navigator.onLine) {
        return;
      }

      return;
    }

    if (this.offlineStatus.isOffline() && isSilent) {
      return;
    }
  }

  private isHttpErrorWrapper(error: unknown): boolean {
    if (error && typeof error === 'object') {
      const err = error as { rejection?: unknown; promise?: unknown };
      return err.rejection instanceof HttpErrorResponse ||
             (err.rejection && typeof err.rejection === 'object' && 'status' in err.rejection);
    }
    return false;
  }

  private extractHttpError(error: unknown): HttpErrorResponse | null {
    if (error && typeof error === 'object') {
      const err = error as { rejection?: unknown };
      if (err.rejection instanceof HttpErrorResponse) {
        return err.rejection;
      }
    }
    return null;
  }
}
