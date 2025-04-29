import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Item {
  id: number;
  name: string;
}

export interface SVConfig {
  appID: string;
  macAddress: string;
  GOid: string;
  interface: string;
  cbref: string;
  svid: string;
  scenariofile: string;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.apiUrl}/items`);
  }

  verifyConfig(config: SVConfig): Observable<{ message: string } | { errors: string[] }> {
    return this.http.post<{ message: string } | { errors: string[] }>(`${this.apiUrl}/verify-config`, config);
  }

  startSimulation(config: SVConfig): Observable<{ message: string } | { error: string }> {
    return this.http.post<{ message: string } | { error: string }>(`${this.apiUrl}/start-simulation`, config);
  }
}