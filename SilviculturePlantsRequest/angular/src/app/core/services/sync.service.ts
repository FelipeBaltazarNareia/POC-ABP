import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OfflineStatusService } from './offline-status.service';
import { OfflineCacheService } from './offline-cache.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  error: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private readonly http = inject(HttpClient);
  private readonly offlineStatus = inject(OfflineStatusService);
  private readonly cacheService = inject(OfflineCacheService);

  private readonly _syncStatus = signal<SyncStatus>({
    lastSyncTime: this.getLastSyncTime(),
    isSyncing: false,
    error: null,
  });

  readonly syncStatus = this._syncStatus.asReadonly();

  private readonly apiUrl = environment.apis?.default?.url ?? '';

  // URLs críticas que devem ser pré-cacheadas
  private readonly criticalUrls = [
    `${this.apiUrl}/.well-known/openid-configuration`,
    `${this.apiUrl}/api/abp/application-configuration`,
    `${this.apiUrl}/api/abp/application-localization`,
  ];

  constructor() {
    // Sincroniza automaticamente quando voltar online
    this.offlineStatus.isOnline();

    // Escuta mudanças de status online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[Sync] Back online, starting sync...');
        this.syncCriticalData();
      });
    }

    // Tenta sincronizar na inicialização se online
    if (this.offlineStatus.isOnline()) {
      this.syncCriticalData();
    }
  }

  /**
   * Sincroniza todos os dados críticos com o servidor
   */
  async syncCriticalData(): Promise<void> {
    if (this._syncStatus().isSyncing) {
      return;
    }

    if (!this.offlineStatus.isOnline()) {
      console.log('[Sync] Offline, skipping sync');
      return;
    }

    this._syncStatus.update(s => ({ ...s, isSyncing: true, error: null }));

    try {
      // Sincroniza cada URL individualmente, ignorando erros individuais
      for (const url of this.criticalUrls) {
        try {
          await this.syncUrl(url);
        } catch {
          // Continua mesmo se uma URL falhar
        }
      }

      const now = new Date();
      this.setLastSyncTime(now);
      this._syncStatus.update(s => ({
        ...s,
        isSyncing: false,
        lastSyncTime: now,
      }));

      console.log('[Sync] Critical data synced successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this._syncStatus.update(s => ({
        ...s,
        isSyncing: false,
        error: errorMessage,
      }));
      console.error('[Sync] Failed to sync critical data:', error);
    }
  }

  /**
   * Sincroniza uma URL específica
   */
  private async syncUrl(url: string): Promise<void> {
    try {
      const cacheKey = 'GET:' + url;
      const response = await firstValueFrom(
        this.http.get(url, { observe: 'response' })
      );

      if (response.body) {
        this.cacheService.set(cacheKey, response.body);
        console.log('[Sync] Cached:', url);
      }
    } catch (error) {
      console.warn('[Sync] Failed to sync URL:', url, error);
      throw error;
    }
  }

  /**
   * Força uma sincronização manual
   */
  async forceSync(): Promise<boolean> {
    if (!this.offlineStatus.isOnline()) {
      this._syncStatus.update(s => ({
        ...s,
        error: 'Cannot sync while offline',
      }));
      return false;
    }

    await this.syncCriticalData();
    return !this._syncStatus().error;
  }

  /**
   * Retorna o tempo desde a última sincronização em formato legível
   */
  getTimeSinceLastSync(): string {
    const lastSync = this._syncStatus().lastSyncTime;
    if (!lastSync) return 'Never';

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  private getLastSyncTime(): Date | null {
    const stored = localStorage.getItem('offline_last_sync');
    return stored ? new Date(stored) : null;
  }

  private setLastSyncTime(date: Date): void {
    localStorage.setItem('offline_last_sync', date.toISOString());
  }
}
