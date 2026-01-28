import { Injectable, inject } from '@angular/core';
import { HttpErrorReporterService } from '@abp/ng.core';
import { HttpErrorResponse } from '@angular/common/http';
import { OfflineStatusService } from './offline-status.service';

const SILENT_URLS = [
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

@Injectable()
export class OfflineHttpErrorReporterService extends HttpErrorReporterService {
  private offlineStatus = inject(OfflineStatusService);

  override reportError(error: HttpErrorResponse): void {
    if (this.shouldSilence(error)) {
      return;
    }

    super.reportError(error);
  }

  private shouldSilence(error: HttpErrorResponse): boolean {
    if (error.status !== 0 && error.status !== 504) {
      return false;
    }

    if (this.offlineStatus.isOffline()) {
      return true;
    }

    const isSilentUrl = SILENT_URLS.some(url => error.url?.includes(url));
    if (isSilentUrl) {
      return true;
    }

    return false;
  }
}
