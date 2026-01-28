import { Component, inject } from '@angular/core';
import { OfflineStatusService } from '../../core/services/offline-status.service';
import { SyncService } from '../../core/services/sync.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  template: `
    @if (offlineStatus.isOffline()) {
      <div class="offline-banner offline">
        <i class="fa fa-wifi-slash me-2"></i>
        Você está offline. Usando dados em cache.
        <span class="sync-info">
          (Última sincronização: {{ syncService.getTimeSinceLastSync() }})
        </span>
      </div>
    } @else if (syncService.syncStatus().isSyncing) {
      <div class="offline-banner syncing">
        <i class="fa fa-sync fa-spin me-2"></i>
        Sincronizando dados...
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      color: white;
      text-align: center;
      padding: 10px 12px;
      z-index: 9999;
      font-weight: 500;
      font-size: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .offline-banner.offline {
      background-color: #f44336;
    }
    .offline-banner.syncing {
      background-color: #2196F3;
    }
    .sync-info {
      opacity: 0.9;
      font-size: 12px;
    }
  `]
})
export class OfflineIndicatorComponent {
  readonly offlineStatus = inject(OfflineStatusService);
  readonly syncService = inject(SyncService);
}
