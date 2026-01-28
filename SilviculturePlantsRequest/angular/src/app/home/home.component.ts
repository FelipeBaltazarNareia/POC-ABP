import { Component, signal, inject } from '@angular/core';
import { WeekSelectionModalComponent } from './components/week-selection-modal.component';
import { RegionSelectionModalComponent } from './components/region-selection-modal.component';
import { SidebarMenuComponent } from './components/sidebar-menu.component';
import { PlantRequestStoreService } from '../core/services/plant-request-store.service';
import { SyncService } from '../core/services/sync.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    WeekSelectionModalComponent,
    RegionSelectionModalComponent,
    SidebarMenuComponent,
  ],
})
export class HomeComponent {
  private readonly store = inject(PlantRequestStoreService);
  private readonly syncService = inject(SyncService);

  readonly company = 'FINCA HERMOSA SA';
  readonly selectedWeek = signal<string | null>(null);
  readonly selectedRegion = signal<string | null>(null);
  readonly showWeekModal = signal(false);
  readonly showRegionModal = signal(false);
  readonly showSidebar = signal(false);
  readonly saved = signal(false);

  onWeekSelected(week: string): void {
    this.selectedWeek.set(week);
    this.showWeekModal.set(false);
  }

  onRegionSelected(region: string): void {
    this.selectedRegion.set(region);
    this.showRegionModal.set(false);
  }

  onContinue(): void {
    const week = this.selectedWeek();
    const region = this.selectedRegion();
    if (!week || !region) return;

    // Salva localmente primeiro
    this.store.add({
      week,
      region,
      company: this.company,
    });

    // Mostra feedback
    this.saved.set(true);
    setTimeout(() => this.saved.set(false), 3000);

    // Tenta sincronizar em background
    this.syncService.syncPlantRequests();

    // Reset form
    this.selectedWeek.set(null);
    this.selectedRegion.set(null);
  }
}
