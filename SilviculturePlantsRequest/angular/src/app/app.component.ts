import { Component } from '@angular/core';
import { DynamicLayoutComponent } from '@abp/ng.core';
import { LoaderBarComponent } from '@abp/ng.theme.shared';
import { OfflineIndicatorComponent } from './shared/components/offline-indicator.component';

@Component({
  selector: 'app-root',
  template: `
    <abp-loader-bar />
    <abp-dynamic-layout />
    <app-offline-indicator />
  `,
  imports: [LoaderBarComponent, DynamicLayoutComponent, OfflineIndicatorComponent],
})
export class AppComponent {}
