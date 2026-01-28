import { Component, inject } from '@angular/core';
import { OfflineStatusService } from '../../core/services/offline-status.service';

@Component({
  selector: 'app-offline-indicator',
  standalone: true,
  template: `
    @if (offlineStatus.isOffline()) {
      <div class="offline-banner">
        <i class="fa fa-wifi me-2"></i>
        Você está offline. Algumas funcionalidades podem estar limitadas.
      </div>
    }
  `,
  styles: [`
    .offline-banner {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background-color: #f44336;
      color: white;
      text-align: center;
      padding: 12px;
      z-index: 9999;
      font-weight: 500;
    }
  `]
})
export class OfflineIndicatorComponent {
  readonly offlineStatus = inject(OfflineStatusService);
}
