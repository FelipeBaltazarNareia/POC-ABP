import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OfflineStatusService {
  private readonly _isOnline = signal(navigator.onLine);

  readonly isOnline = this._isOnline.asReadonly();
  readonly isOffline = () => !this._isOnline();

  constructor() {
    window.addEventListener('online', () => this._isOnline.set(true));
    window.addEventListener('offline', () => this._isOnline.set(false));
  }
}
