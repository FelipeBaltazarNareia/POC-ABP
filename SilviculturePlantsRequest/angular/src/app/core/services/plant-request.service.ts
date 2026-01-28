import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface CreatePlantRequestDto {
  week: string;
  region: string;
  company: string;
}

export interface PlantRequestDto {
  id: string;
  week: string;
  region: string;
  company: string;
  status: PlantRequestStatus;
  creationTime: string;
}

export enum PlantRequestStatus {
  Pending = 0,
  Synced = 1,
}

@Injectable({ providedIn: 'root' })
export class PlantRequestService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apis?.default?.url ?? ''}/api/app/plant-request`;

  create(dto: CreatePlantRequestDto): Observable<PlantRequestDto> {
    return this.http.post<PlantRequestDto>(this.apiUrl, dto);
  }

  getList(): Observable<PlantRequestDto[]> {
    return this.http.get<PlantRequestDto[]>(this.apiUrl);
  }
}
