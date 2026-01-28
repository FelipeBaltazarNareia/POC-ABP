import { Component, output, signal } from '@angular/core';

interface WeekOption {
  label: string;
  value: string;
  status: 'Activa' | 'Inactiva';
}

@Component({
  selector: 'app-week-selection-modal',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="closed.emit()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3 class="modal-title">Seleccione la semana</h3>
          <button class="close-btn" (click)="closed.emit()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          @for (week of weeks; track week.value) {
            <div
              class="list-item"
              [class.selected]="selectedWeek() === week.value"
              (click)="selectedWeek.set(week.value)">
              <div class="item-radio">
                <div class="radio-outer">
                  @if (selectedWeek() === week.value) {
                    <div class="radio-inner"></div>
                  }
                </div>
              </div>
              <span class="item-label">{{ week.label }}</span>
              <span class="item-status" [class]="'status-' + week.status.toLowerCase()">
                ({{ week.status }})
              </span>
            </div>
          }
        </div>
        <div class="modal-footer">
          <button
            class="btn-confirm"
            [disabled]="!selectedWeek()"
            (click)="selected.emit(selectedWeek()!)">
            CONFIRMAR SELECCIÓN
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 16px;
    }
    .modal-content {
      background: #fff;
      border-radius: 12px;
      width: 100%;
      max-width: 400px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px 20px;
      border-bottom: 1px solid #e0e0e0;
    }
    .modal-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #1a2332;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 20px;
      color: #666;
      cursor: pointer;
      padding: 4px 8px;
    }
    .modal-body {
      overflow-y: auto;
      padding: 8px 0;
    }
    .list-item {
      display: flex;
      align-items: center;
      padding: 14px 20px;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .list-item:hover {
      background: #f5f5f5;
    }
    .list-item.selected {
      background: #e8f5e9;
    }
    .item-radio {
      margin-right: 12px;
    }
    .radio-outer {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      border: 2px solid #4caf50;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .radio-inner {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #4caf50;
    }
    .item-label {
      font-size: 16px;
      color: #333;
      flex: 1;
    }
    .item-status {
      font-size: 13px;
      margin-left: 8px;
    }
    .status-activa {
      color: #4caf50;
    }
    .status-inactiva {
      color: #999;
    }
    .modal-footer {
      padding: 16px 20px;
      border-top: 1px solid #e0e0e0;
    }
    .btn-confirm {
      width: 100%;
      padding: 14px;
      background: #4caf50;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.5px;
    }
    .btn-confirm:disabled {
      background: #c8e6c9;
      cursor: not-allowed;
    }
  `],
})
export class WeekSelectionModalComponent {
  readonly selected = output<string>();
  readonly closed = output<void>();
  readonly selectedWeek = signal<string | null>(null);

  readonly weeks: WeekOption[] = [
    { label: 'Semana 35', value: 'Semana 35 (Activa)', status: 'Activa' },
    { label: 'Semana 34', value: 'Semana 34 (Activa)', status: 'Activa' },
    { label: 'Semana 33', value: 'Semana 33 (Inactiva)', status: 'Inactiva' },
  ];
}
