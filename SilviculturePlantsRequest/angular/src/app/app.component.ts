import { Component } from '@angular/core';
import { DynamicLayoutComponent } from '@abp/ng.core';
import { LoaderBarComponent } from '@abp/ng.theme.shared';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator.component';
import { SyncOverlayComponent } from './shared/components/sync-overlay.component';

@Component({
  selector: 'app-root',
  template: `
    <abp-loader-bar />
    <abp-dynamic-layout />
    <app-offline-indicator />
    <app-sync-overlay />
  `,
  imports: [LoaderBarComponent, DynamicLayoutComponent, OfflineIndicatorComponent, SyncOverlayComponent],
})
export class AppComponent {}
