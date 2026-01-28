import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { OfflineStatusService } from './offline-status.service';
import { OfflineCacheService } from './offline-cache.service';
import { PlantRequestStoreService } from './plant-request-store.service';
import { PlantRequestService } from './plant-request.service';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface SyncResult {
  success: boolean;
  totalSynced: number;
  totalFailed: number;
  errors: string[];
}

interface SyncStatus {
  lastSyncTime: Date | null;
  isSyncing: boolean;
  error: string | null;
  showOverlay: boolean;
  pendingPlantRequests: number;
  syncedPlantRequests: number;
  syncComplete: boolean;
  syncResult: SyncResult | null;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private readonly http = inject(HttpClient);
  private readonly offlineStatus = inject(OfflineStatusService);
  private readonly cacheService = inject(OfflineCacheService);
  private readonly plantRequestStore = inject(PlantRequestStoreService);
  private readonly plantRequestApi = inject(PlantRequestService);

  private readonly _syncStatus = signal<SyncStatus>({
    lastSyncTime: this.getLastSyncTime(),
    isSyncing: false,
    error: null,
    showOverlay: false,
    pendingPlantRequests: 0,
    syncedPlantRequests: 0,
    syncComplete: false,
    syncResult: null,
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
    // Escuta mudanças de status online
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        console.log('[Sync] Back online, starting sync...');
        this.syncCriticalData();
        this.syncPlantRequests();
      });
    }

    // Tenta sincronizar na inicialização se online
    if (this.offlineStatus.isOnline()) {
      this.syncCriticalData();
    }

    // Atualiza contadores
    this._syncStatus.update(s => ({
      ...s,
      pendingPlantRequests: this.plantRequestStore.pendingCount(),
      syncedPlantRequests: this.plantRequestStore.syncedCount(),
    }));
  }

  /**
   * Sincronização completa com overlay bloqueante.
   * NÃO fecha automaticamente - usuário deve clicar para fechar.
   */
  async fullSync(): Promise<void> {
    if (this._syncStatus().isSyncing) return;

    this._syncStatus.update(s => ({
      ...s,
      showOverlay: true,
      isSyncing: true,
      error: null,
      syncComplete: false,
      syncResult: null,
    }));

    const result: SyncResult = {
      success: true,
      totalSynced: 0,
      totalFailed: 0,
      errors: [],
    };

    try {
      if (!this.offlineStatus.isOnline()) {
        result.success = false;
        result.errors.push('Sin conexión a internet. Verifique su conexión e intente nuevamente.');
      } else {
        // Sync critical data
        await this.syncCriticalData();

        // Sync plant requests
        const plantSyncResult = await this.syncPlantRequestsWithResult();
        result.totalSynced = plantSyncResult.synced;
        result.totalFailed = plantSyncResult.failed;
        result.errors = plantSyncResult.errors;

        if (plantSyncResult.failed > 0) {
          result.success = false;
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(this.formatError(error));
      console.error('[Sync] Full sync failed:', error);
    }

    // Atualiza estado final - NÃO fecha o overlay
    this._syncStatus.update(s => ({
      ...s,
      isSyncing: false,
      syncComplete: true,
      syncResult: result,
      error: result.success ? null : result.errors.join('\n'),
      pendingPlantRequests: this.plantRequestStore.pendingCount(),
      syncedPlantRequests: this.plantRequestStore.syncedCount(),
    }));
  }

  /**
   * Sincroniza solicitações de plantas e retorna resultado detalhado
   */
  private async syncPlantRequestsWithResult(): Promise<{ synced: number; failed: number; errors: string[] }> {
    const pending = this.plantRequestStore.pendingRequests();
    const result = { synced: 0, failed: 0, errors: [] as string[] };

    if (pending.length === 0) {
      return result;
    }

    console.log(`[Sync] Syncing ${pending.length} pending plant request(s)...`);

    for (const req of pending) {
      try {
        const apiResult = await firstValueFrom(
          this.plantRequestApi.create({
            week: req.week,
            region: req.region,
            company: req.company,
          })
        );
        this.plantRequestStore.markSynced(req.localId, apiResult.id);
        result.synced++;
        console.log(`[Sync] Plant request ${req.localId} synced -> ${apiResult.id}`);
      } catch (error) {
        result.failed++;
        const errorMsg = `Solicitud "${req.week} - ${req.region}": ${this.formatError(error)}`;
        result.errors.push(errorMsg);
        console.warn('[Sync] Failed to sync plant request:', req.localId, error);
      }
    }

    return result;
  }

  /**
   * Formata erro para exibição amigável
   */
  private formatError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'No se pudo conectar con el servidor. Verifique su conexión.';
      }
      if (error.status === 401) {
        return 'Sesión expirada. Por favor, inicie sesión nuevamente.';
      }
      if (error.status === 403) {
        return 'No tiene permisos para realizar esta acción.';
      }
      if (error.status === 500) {
        return 'Error interno del servidor. Intente más tarde.';
      }
      if (error.error?.error?.message) {
        return error.error.error.message;
      }
      return `Error del servidor (${error.status}): ${error.statusText}`;
    }
    if (error instanceof Error) {
      return error.message;
    }
    return 'Error desconocido durante la sincronización.';
  }

  /**
   * Sincroniza todos os dados críticos com o servidor
   */
  async syncCriticalData(): Promise<void> {
    if (!this.offlineStatus.isOnline()) {
      console.log('[Sync] Offline, skipping sync');
      return;
    }

    try {
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
        lastSyncTime: now,
      }));

      console.log('[Sync] Critical data synced successfully');
    } catch (error) {
      console.error('[Sync] Failed to sync critical data:', error);
    }
  }

  /**
   * Sincroniza solicitações de plantas pendentes com a API (versão simples)
   */
  async syncPlantRequests(): Promise<void> {
    const pending = this.plantRequestStore.pendingRequests();
    if (pending.length === 0) return;

    console.log(`[Sync] Syncing ${pending.length} pending plant request(s)...`);

    for (const req of pending) {
      try {
        const result = await firstValueFrom(
          this.plantRequestApi.create({
            week: req.week,
            region: req.region,
            company: req.company,
          })
        );
        this.plantRequestStore.markSynced(req.localId, result.id);
        console.log(`[Sync] Plant request ${req.localId} synced -> ${result.id}`);
      } catch (error) {
        console.warn('[Sync] Failed to sync plant request:', req.localId, error);
      }
    }

    this._syncStatus.update(s => ({
      ...s,
      pendingPlantRequests: this.plantRequestStore.pendingCount(),
      syncedPlantRequests: this.plantRequestStore.syncedCount(),
    }));
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
    await this.syncPlantRequests();
    return !this._syncStatus().error;
  }

  /**
   * Retorna o tempo desde a última sincronização em formato legível
   */
  getTimeSinceLastSync(): string {
    const lastSync = this._syncStatus().lastSyncTime;
    if (!lastSync) return 'Nunca';

    const now = new Date();
    const diffMs = now.getTime() - lastSync.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Agora';
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    return `${diffDays}d atrás`;
  }

  /**
   * Esconde o overlay manualmente
   */
  dismissOverlay(): void {
    this._syncStatus.update(s => ({
      ...s,
      showOverlay: false,
      syncComplete: false,
      syncResult: null,
    }));
  }

  private getLastSyncTime(): Date | null {
    const stored = localStorage.getItem('offline_last_sync');
    return stored ? new Date(stored) : null;
  }

  private setLastSyncTime(date: Date): void {
    localStorage.setItem('offline_last_sync', date.toISOString());
  }
}
