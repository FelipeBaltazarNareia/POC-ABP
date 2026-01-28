import { ErrorHandler, Injectable, inject, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { OfflineStatusService } from '../services/offline-status.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private ngZone = inject(NgZone);
  private offlineStatus = inject(OfflineStatusService);

  // URLs de configuração que não devem mostrar erro ao usuário
  private readonly silentUrls = [
    '/.well-known/openid-configuration',
    '/api/abp/application-configuration',
    '/api/abp/application-localization',
    '/connect/userinfo',
  ];

  handleError(error: unknown): void {
    // Executa fora do Angular para evitar loops infinitos
    this.ngZone.runOutsideAngular(() => {
      // Verifica se é erro HTTP
      if (error instanceof HttpErrorResponse) {
        this.handleHttpError(error);
        return;
      }

      // Verifica se é erro de promise rejeitada com HttpErrorResponse
      if (this.isHttpErrorWrapper(error)) {
        const httpError = this.extractHttpError(error);
        if (httpError) {
          this.handleHttpError(httpError);
          return;
        }
      }

      // Para outros erros, apenas loga
      console.error('[GlobalErrorHandler] Unhandled error:', error);
    });
  }

  private handleHttpError(error: HttpErrorResponse): void {
    // Se está offline e é uma URL silenciosa, não mostra erro
    if (this.offlineStatus.isOffline() || error.status === 0) {
      const isSilent = this.silentUrls.some(url => error.url?.includes(url));
      if (isSilent) {
        console.log('[GlobalErrorHandler] Silent offline error for:', error.url);
        return;
      }
    }

    // Para erros de rede quando offline, mostra mensagem mais amigável
    if (error.status === 0 && !navigator.onLine) {
      console.warn('[GlobalErrorHandler] Network error while offline:', error.url);
      return;
    }

    // Loga o erro HTTP
    console.error('[GlobalErrorHandler] HTTP error:', {
      status: error.status,
      message: error.message,
      url: error.url,
    });
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
