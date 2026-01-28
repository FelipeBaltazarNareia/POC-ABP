import { Component, inject } from '@angular/core';
import { SyncService } from '../../core/services/sync.service';
import { PlantRequestStoreService } from '../../core/services/plant-request-store.service';

@Component({
  selector: 'app-sync-overlay',
  standalone: true,
  template: `
    @if (syncService.syncStatus().showOverlay) {
      <div class="sync-overlay">
        <div class="sync-content">
          <div class="plant-icon">
            <i class="fas fa-seedling"></i>
          </div>

          <h2 class="sync-title">Última sincronización</h2>
          <p class="sync-time">{{ syncService.getTimeSinceLastSync() }}</p>

          <div class="sync-stats">
            <div class="stat-row">
              <span class="stat-label">Solicitudes de plantas</span>
              <span class="stat-value">{{ store.requests().length }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Solicitudes pendientes enviadas</span>
              <span class="stat-value">{{ store.pendingCount() }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">Solicitudes sincronizadas</span>
              <span class="stat-value">{{ store.syncedCount() }}</span>
            </div>
          </div>

          @if (syncService.syncStatus().isSyncing) {
            <div class="sync-spinner">
              <i class="fas fa-sync fa-spin"></i>
              <p>Sincronizando...</p>
            </div>
          } @else {
            <div class="sync-actions">
              @if (syncService.syncStatus().error) {
                <p class="sync-error">{{ syncService.syncStatus().error }}</p>
              }
              <button class="btn-refresh" (click)="syncService.fullSync()">
                <i class="fas fa-sync-alt"></i> Reintentar
              </button>
              <button class="btn-dismiss" (click)="syncService.dismissOverlay()">
                Continuar offline
              </button>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [`
    .sync-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: #fff;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .sync-content {
      text-align: center;
      padding: 24px;
      max-width: 360px;
      width: 100%;
    }
    .plant-icon {
      margin-bottom: 20px;
    }
    .plant-icon i {
      font-size: 64px;
      color: #4caf50;
    }
    .sync-title {
      font-size: 20px;
      font-weight: 600;
      color: #4caf50;
      margin: 0 0 8px;
    }
    .sync-time {
      font-size: 14px;
      color: #888;
      margin: 0 0 24px;
    }
    .sync-stats {
      text-align: left;
      margin-bottom: 32px;
    }
    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 10px 0;
      border-bottom: 1px solid #f0f0f0;
      font-size: 14px;
    }
    .stat-label {
      color: #555;
    }
    .stat-value {
      font-weight: 600;
      color: #333;
    }
    .sync-spinner {
      margin-top: 16px;
    }
    .sync-spinner i {
      font-size: 32px;
      color: #4caf50;
    }
    .sync-spinner p {
      margin-top: 12px;
      font-size: 14px;
      color: #666;
    }
    .sync-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .sync-error {
      color: #d32f2f;
      font-size: 13px;
      margin: 0 0 4px;
    }
    .btn-refresh {
      padding: 12px 24px;
      background: #4caf50;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-dismiss {
      padding: 10px 24px;
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
      border-radius: 8px;
      font-size: 14px;
      cursor: pointer;
    }
  `],
})
export class SyncOverlayComponent {
  readonly syncService = inject(SyncService);
  readonly store = inject(PlantRequestStoreService);
}
