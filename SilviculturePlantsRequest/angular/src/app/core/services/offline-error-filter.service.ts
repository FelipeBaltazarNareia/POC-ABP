import { Injectable, inject } from '@angular/core';
import { HttpErrorReporterService } from '@abp/ng.core';
import { HttpErrorResponse } from '@angular/common/http';
import { OfflineStatusService } from './offline-status.service';

// URLs que não devem mostrar erro ao usuário quando offline
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

/**
 * Serviço que sobrescreve o HttpErrorReporterService do ABP
 * para filtrar erros quando offline
 */
@Injectable()
export class OfflineHttpErrorReporterService extends HttpErrorReporterService {
  private offlineStatus = inject(OfflineStatusService);

  override reportError(error: HttpErrorResponse): void {
    // Se é erro de rede (status 0) e estamos offline ou é uma URL silenciosa
    if (this.shouldSilence(error)) {
      console.log('[OfflineErrorFilter] Silencing error for:', error.url);
      return;
    }

    // Caso contrário, reporta normalmente
    super.reportError(error);
  }

  private shouldSilence(error: HttpErrorResponse): boolean {
    // Se não é erro de rede, não silencia
    if (error.status !== 0 && error.status !== 504) {
      return false;
    }

    // Se estiver offline, silencia todos os erros de rede
    if (this.offlineStatus.isOffline()) {
      return true;
    }

    // Se é uma URL da lista silenciosa
    const isSilentUrl = SILENT_URLS.some(url => error.url?.includes(url));
    if (isSilentUrl) {
      return true;
    }

    return false;
  }
}
