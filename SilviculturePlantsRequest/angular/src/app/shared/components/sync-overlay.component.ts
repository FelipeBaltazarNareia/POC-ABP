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
          <!-- Icon based on state -->
          <div class="status-icon" [class]="iconClass">
            <i [class]="iconName"></i>
          </div>

          <!-- Title based on state -->
          <h2 class="sync-title" [class]="titleClass">{{ title }}</h2>

          <!-- Syncing state -->
          @if (syncService.syncStatus().isSyncing) {
            <p class="sync-subtitle">Aguarde mientras sincronizamos sus datos...</p>

            <div class="sync-stats">
              <div class="stat-row">
                <span class="stat-label">Solicitudes pendientes</span>
                <span class="stat-value">{{ store.pendingCount() }}</span>
              </div>
              <div class="stat-row">
                <span class="stat-label">Sincronizadas</span>
                <span class="stat-value">{{ store.syncedCount() }}</span>
              </div>
            </div>

            <div class="sync-spinner">
              <div class="spinner"></div>
              <p>Sincronizando...</p>
            </div>
          }

          <!-- Completed state -->
          @if (syncService.syncStatus().syncComplete) {
            @if (syncService.syncStatus().syncResult; as result) {
              <!-- Success -->
              @if (result.success) {
                <p class="sync-subtitle success">
                  Todos los datos fueron sincronizados correctamente.
                </p>

                <div class="result-summary success">
                  <div class="summary-item">
                    <i class="fas fa-check-circle"></i>
                    <span>{{ result.totalSynced }} solicitud(es) sincronizada(s)</span>
                  </div>
                  @if (store.syncedCount() > 0) {
                    <div class="summary-item">
                      <i class="fas fa-cloud"></i>
                      <span>Total en servidor: {{ store.syncedCount() }}</span>
                    </div>
                  }
                </div>
              } @else {
                <!-- Error -->
                <p class="sync-subtitle error">
                  Ocurrieron problemas durante la sincronización.
                </p>

                <div class="result-summary error">
                  @if (result.totalSynced > 0) {
                    <div class="summary-item success">
                      <i class="fas fa-check-circle"></i>
                      <span>{{ result.totalSynced }} sincronizada(s) correctamente</span>
                    </div>
                  }
                  @if (result.totalFailed > 0) {
                    <div class="summary-item error">
                      <i class="fas fa-times-circle"></i>
                      <span>{{ result.totalFailed }} con error</span>
                    </div>
                  }
                </div>

                <!-- Error details -->
                @if (result.errors.length > 0) {
                  <div class="error-details">
                    <p class="error-title">
                      <i class="fas fa-exclamation-triangle"></i>
                      Detalles del error:
                    </p>
                    <ul class="error-list">
                      @for (err of result.errors; track err) {
                        <li>{{ err }}</li>
                      }
                    </ul>
                  </div>
                }
              }

              <!-- Action buttons -->
              <div class="sync-actions">
                @if (!result.success) {
                  <button class="btn-retry" (click)="syncService.fullSync()">
                    <i class="fas fa-sync-alt"></i> Reintentar
                  </button>
                }
                <button class="btn-close" [class.success]="result.success" (click)="syncService.dismissOverlay()">
                  {{ result.success ? 'Continuar' : 'Cerrar' }}
                </button>
              </div>
            }
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
      padding: 24px;
    }

    .sync-content {
      text-align: center;
      max-width: 400px;
      width: 100%;
    }

    .status-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 20px;
    }

    .status-icon i {
      font-size: 40px;
    }

    .status-icon.syncing {
      background: #e3f2fd;
      color: #1976d2;
    }

    .status-icon.success {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-icon.error {
      background: #ffebee;
      color: #c62828;
    }

    .sync-title {
      font-size: 22px;
      font-weight: 600;
      margin: 0 0 8px;
    }

    .sync-title.syncing {
      color: #1976d2;
    }

    .sync-title.success {
      color: #2e7d32;
    }

    .sync-title.error {
      color: #c62828;
    }

    .sync-subtitle {
      font-size: 14px;
      color: #666;
      margin: 0 0 24px;
    }

    .sync-subtitle.success {
      color: #2e7d32;
    }

    .sync-subtitle.error {
      color: #c62828;
    }

    .sync-stats {
      text-align: left;
      margin-bottom: 24px;
      background: #f5f5f5;
      border-radius: 8px;
      padding: 12px 16px;
    }

    .stat-row {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      font-size: 14px;
    }

    .stat-row:not(:last-child) {
      border-bottom: 1px solid #e0e0e0;
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

    .spinner {
      width: 40px;
      height: 40px;
      border: 3px solid #e3f2fd;
      border-top-color: #1976d2;
      border-radius: 50%;
      margin: 0 auto 12px;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .sync-spinner p {
      font-size: 14px;
      color: #666;
    }

    .result-summary {
      background: #f5f5f5;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
    }

    .result-summary.success {
      background: #e8f5e9;
    }

    .result-summary.error {
      background: #fafafa;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 0;
      font-size: 14px;
    }

    .summary-item:not(:last-child) {
      border-bottom: 1px solid rgba(0,0,0,0.08);
    }

    .summary-item i {
      font-size: 16px;
    }

    .summary-item.success, .summary-item.success i {
      color: #2e7d32;
    }

    .summary-item.error, .summary-item.error i {
      color: #c62828;
    }

    .error-details {
      background: #ffebee;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 20px;
      text-align: left;
    }

    .error-title {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #c62828;
      margin: 0 0 12px;
    }

    .error-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: #b71c1c;
    }

    .error-list li {
      margin-bottom: 6px;
    }

    .error-list li:last-child {
      margin-bottom: 0;
    }

    .sync-actions {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-top: 24px;
    }

    .btn-retry {
      padding: 14px 24px;
      background: #ff9800;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .btn-retry:hover {
      background: #f57c00;
    }

    .btn-close {
      padding: 14px 24px;
      background: #f5f5f5;
      color: #333;
      border: none;
      border-radius: 8px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
    }

    .btn-close:hover {
      background: #e0e0e0;
    }

    .btn-close.success {
      background: #4caf50;
      color: #fff;
    }

    .btn-close.success:hover {
      background: #43a047;
    }
  `],
})
export class SyncOverlayComponent {
  readonly syncService = inject(SyncService);
  readonly store = inject(PlantRequestStoreService);

  get iconClass(): string {
    const status = this.syncService.syncStatus();
    if (status.isSyncing) return 'syncing';
    if (status.syncResult?.success) return 'success';
    return 'error';
  }

  get iconName(): string {
    const status = this.syncService.syncStatus();
    if (status.isSyncing) return 'fas fa-sync fa-spin';
    if (status.syncResult?.success) return 'fas fa-check-circle';
    return 'fas fa-exclamation-circle';
  }

  get titleClass(): string {
    return this.iconClass;
  }

  get title(): string {
    const status = this.syncService.syncStatus();
    if (status.isSyncing) return 'Sincronizando...';
    if (status.syncResult?.success) return 'Sincronización exitosa';
    return 'Error en sincronización';
  }
}
