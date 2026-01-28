import { Component, output, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ConfigStateService } from '@abp/ng.core';
import { OAuthService } from 'angular-oauth2-oidc';
import { SyncService } from '../../core/services/sync.service';
import { PlantRequestStoreService } from '../../core/services/plant-request-store.service';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  template: `
    <div class="sidebar-backdrop" (click)="closed.emit()">
      <div class="sidebar" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="sidebar-header">
          <button class="back-btn" (click)="closed.emit()">
            <i class="fas fa-arrow-left"></i>
          </button>
          <div class="user-avatar">
            <i class="fas fa-user-circle"></i>
          </div>
          <div class="user-name">{{ userName }}</div>
          <div class="user-detail">{{ orgName }}</div>
          <div class="user-detail">{{ userEmail }}</div>
          <div class="user-detail">{{ userId }}</div>
          <div class="user-week">Semana 34</div>
        </div>

        <!-- Navigation -->
        <nav class="sidebar-nav">
          <a class="nav-item" (click)="closed.emit()">
            <i class="fas fa-home"></i>
            <span>Inicio</span>
          </a>
          <a class="nav-item" (click)="onHistory()">
            <i class="fas fa-history"></i>
            <span>Histórico</span>
            @if (pendingCount > 0) {
              <span class="badge pending">{{ pendingCount }}</span>
            }
          </a>
          <a class="nav-item" (click)="onSync()">
            <i class="fas fa-sync"></i>
            <span>Sincronizar</span>
          </a>
          <a class="nav-item" (click)="closed.emit()">
            <i class="fas fa-info-circle"></i>
            <span>Acerca de</span>
          </a>
          <div class="nav-divider"></div>
          <a class="nav-item logout" (click)="onLogout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Cerrar sesión</span>
          </a>
        </nav>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.4);
      z-index: 2000;
    }
    .sidebar {
      position: absolute;
      top: 0; left: 0; bottom: 0;
      width: 280px;
      background: #fff;
      display: flex;
      flex-direction: column;
      box-shadow: 2px 0 8px rgba(0,0,0,0.2);
      animation: slideIn 0.25s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(-100%); }
      to { transform: translateX(0); }
    }
    .sidebar-header {
      background: #1a3a3a;
      color: #fff;
      padding: 20px;
      position: relative;
    }
    .back-btn {
      position: absolute;
      top: 12px;
      left: 12px;
      background: none;
      border: none;
      color: #fff;
      font-size: 18px;
      cursor: pointer;
      padding: 4px 8px;
    }
    .user-avatar {
      margin-top: 16px;
      margin-bottom: 12px;
    }
    .user-avatar i {
      font-size: 56px;
      opacity: 0.9;
    }
    .user-name {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .user-detail {
      font-size: 13px;
      opacity: 0.8;
      margin-bottom: 2px;
    }
    .user-week {
      font-size: 13px;
      opacity: 0.8;
      margin-top: 8px;
      padding-top: 8px;
      border-top: 1px solid rgba(255,255,255,0.2);
    }
    .sidebar-nav {
      flex: 1;
      padding: 8px 0;
    }
    .nav-item {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      color: #333;
      text-decoration: none;
      font-size: 15px;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .nav-item:hover {
      background: #f5f5f5;
    }
    .nav-item i {
      width: 24px;
      margin-right: 16px;
      text-align: center;
      font-size: 16px;
      color: #555;
    }
    .nav-divider {
      height: 1px;
      background: #e0e0e0;
      margin: 4px 0;
    }
    .nav-item.logout {
      color: #d32f2f;
    }
    .nav-item.logout i {
      color: #d32f2f;
    }
    .badge {
      margin-left: auto;
      padding: 2px 8px;
      border-radius: 10px;
      font-size: 11px;
      font-weight: 600;
    }
    .badge.pending {
      background: #fff3e0;
      color: #e65100;
    }
  `],
})
export class SidebarMenuComponent {
  readonly closed = output<void>();
  private readonly router = inject(Router);
  private readonly configState = inject(ConfigStateService);
  private readonly oauthService = inject(OAuthService);
  private readonly syncService = inject(SyncService);
  private readonly plantRequestStore = inject(PlantRequestStoreService);

  get userName(): string {
    return this.configState.getOne('currentUser')?.userName ?? 'Usuario';
  }

  get userEmail(): string {
    return this.configState.getOne('currentUser')?.email ?? '';
  }

  get userId(): string {
    const id = this.configState.getOne('currentUser')?.id;
    return id ? `ID: ${id.substring(0, 8)}` : '';
  }

  get orgName(): string {
    return 'Forestal Oriental SA';
  }

  get pendingCount(): number {
    return this.plantRequestStore.pendingCount();
  }

  onHistory(): void {
    this.closed.emit();
    this.router.navigate(['/history']);
  }

  onSync(): void {
    this.syncService.fullSync();
    this.closed.emit();
  }

  onLogout(): void {
    this.oauthService.logOut();
  }
}
