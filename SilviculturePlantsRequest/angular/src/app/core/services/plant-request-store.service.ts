import { Injectable, signal, computed } from '@angular/core';

export interface LocalPlantRequest {
  localId: string;
  week: string;
  region: string;
  company: string;
  synced: boolean;
  serverId?: string;
  createdAt: string;
}

const STORE_KEY = 'plant_requests';

@Injectable({ providedIn: 'root' })
export class PlantRequestStoreService {
  private readonly _requests = signal<LocalPlantRequest[]>(this.loadFromStorage());

  readonly requests = this._requests.asReadonly();
  readonly pendingRequests = computed(() => this._requests().filter(r => !r.synced));
  readonly pendingCount = computed(() => this.pendingRequests().length);
  readonly syncedCount = computed(() => this._requests().filter(r => r.synced).length);

  add(request: Omit<LocalPlantRequest, 'localId' | 'synced' | 'createdAt'>): LocalPlantRequest {
    const newRequest: LocalPlantRequest = {
      ...request,
      localId: crypto.randomUUID(),
      synced: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...this._requests(), newRequest];
    this._requests.set(updated);
    this.saveToStorage(updated);
    return newRequest;
  }

  markSynced(localId: string, serverId: string): void {
    const updated = this._requests().map(r =>
      r.localId === localId ? { ...r, synced: true, serverId } : r
    );
    this._requests.set(updated);
    this.saveToStorage(updated);
  }

  private loadFromStorage(): LocalPlantRequest[] {
    try {
      const data = localStorage.getItem(STORE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(requests: LocalPlantRequest[]): void {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(requests));
    } catch (e) {
      console.warn('[PlantRequestStore] Failed to save:', e);
    }
  }
}
