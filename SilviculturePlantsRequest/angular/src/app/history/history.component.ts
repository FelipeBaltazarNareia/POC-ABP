import { Component, inject, computed } from '@angular/core';
import { Router } from '@angular/router';
import { PlantRequestStoreService, LocalPlantRequest } from '../core/services/plant-request-store.service';
import { SyncService } from '../core/services/sync.service';

@Component({
  selector: 'app-history',
  standalone: true,
  template: `
    <!-- Header -->
    <div class="app-header">
      <button class="back-btn" (click)="goBack()">
        <i class="fas fa-arrow-left"></i>
      </button>
      <span class="header-title">Histórico de Solicitudes</span>
      <button class="sync-btn" (click)="onSync()" [disabled]="syncService.syncStatus().isSyncing">
        <i class="fas fa-sync" [class.fa-spin]="syncService.syncStatus().isSyncing"></i>
      </button>
    </div>

    <!-- Stats summary -->
    <div class="stats-bar">
      <div class="stat-item">
        <span class="stat-value">{{ store.requests().length }}</span>
        <span class="stat-label">Total</span>
      </div>
      <div class="stat-item synced">
        <span class="stat-value">{{ store.syncedCount() }}</span>
        <span class="stat-label">Sincronizadas</span>
      </div>
      <div class="stat-item pending">
        <span class="stat-value">{{ store.pendingCount() }}</span>
        <span class="stat-label">Pendientes</span>
      </div>
    </div>

    <!-- Request list -->
    <div class="content-area">
      @if (sortedRequests().length === 0) {
        <div class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No hay solicitudes registradas</p>
        </div>
      } @else {
        <div class="request-list">
          @for (request of sortedRequests(); track request.localId) {
            <div class="request-card" [class.synced]="request.synced">
              <div class="request-status">
                @if (request.synced) {
                  <div class="status-badge synced">
                    <i class="fas fa-check-circle"></i>
                    Sincronizada
                  </div>
                } @else {
                  <div class="status-badge pending">
                    <i class="fas fa-clock"></i>
                    Pendiente
                  </div>
                }
              </div>
              <div class="request-details">
                <div class="detail-row">
                  <span class="detail-label">Empresa</span>
                  <span class="detail-value">{{ request.company }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Semana</span>
                  <span class="detail-value">{{ request.week }}</span>
                </div>
                <div class="detail-row">
                  <span class="detail-label">Región</span>
                  <span class="detail-value">{{ request.region }}</span>
                </div>
              </div>
              <div class="request-footer">
                <span class="request-date">
                  <i class="fas fa-calendar-alt"></i>
                  {{ formatDate(request.createdAt) }}
                </span>
                @if (request.serverId) {
                  <span class="server-id" title="ID del servidor">
                    <i class="fas fa-cloud"></i>
                    {{ request.serverId.substring(0, 8) }}...
                  </span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: #f5f5f5;
    }

    .app-header {
      display: flex;
      align-items: center;
      background: #1a2332;
      color: #fff;
      padding: 0 8px;
      height: 56px;
      flex-shrink: 0;
    }

    .back-btn, .sync-btn {
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      padding: 12px;
      cursor: pointer;
    }

    .sync-btn:disabled {
      opacity: 0.6;
    }

    .header-title {
      flex: 1;
      font-size: 18px;
      font-weight: 500;
      text-align: center;
    }

    .stats-bar {
      display: flex;
      background: #fff;
      padding: 16px;
      gap: 12px;
      border-bottom: 1px solid #e0e0e0;
    }

    .stat-item {
      flex: 1;
      text-align: center;
      padding: 8px;
      border-radius: 8px;
      background: #f5f5f5;
    }

    .stat-item.synced {
      background: #e8f5e9;
    }

    .stat-item.pending {
      background: #fff3e0;
    }

    .stat-value {
      display: block;
      font-size: 24px;
      font-weight: 700;
      color: #333;
    }

    .stat-item.synced .stat-value {
      color: #2e7d32;
    }

    .stat-item.pending .stat-value {
      color: #e65100;
    }

    .stat-label {
      font-size: 11px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .content-area {
      flex: 1;
      padding: 16px;
      overflow-y: auto;
    }

    .empty-state {
      text-align: center;
      padding: 48px 24px;
      color: #999;
    }

    .empty-state i {
      font-size: 48px;
      margin-bottom: 16px;
    }

    .empty-state p {
      font-size: 16px;
    }

    .request-list {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .request-card {
      background: #fff;
      border-radius: 12px;
      padding: 16px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border-left: 4px solid #ff9800;
    }

    .request-card.synced {
      border-left-color: #4caf50;
    }

    .request-status {
      margin-bottom: 12px;
    }

    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 600;
    }

    .status-badge.synced {
      background: #e8f5e9;
      color: #2e7d32;
    }

    .status-badge.pending {
      background: #fff3e0;
      color: #e65100;
    }

    .request-details {
      margin-bottom: 12px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid #f5f5f5;
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 13px;
      color: #888;
    }

    .detail-value {
      font-size: 14px;
      color: #333;
      font-weight: 500;
    }

    .request-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid #f0f0f0;
      font-size: 12px;
      color: #999;
    }

    .request-date, .server-id {
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .server-id {
      color: #4caf50;
    }
  `],
})
export class HistoryComponent {
  readonly store = inject(PlantRequestStoreService);
  readonly syncService = inject(SyncService);
  private readonly router = inject(Router);

  readonly sortedRequests = computed(() => {
    return [...this.store.requests()].sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  });

  goBack(): void {
    this.router.navigate(['/']);
  }

  onSync(): void {
    this.syncService.syncPlantRequests();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
