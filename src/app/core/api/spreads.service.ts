import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE_URL } from '../config/api-config';
export interface Spread { id: string; positions: string[]; }
@Injectable({providedIn:'root'})
export class SpreadsService {
 private readonly http = inject(HttpClient);
 private readonly base = inject(API_BASE_URL);
 list() { return this.http.get<Spread[]>(`${this.base}/spreads`); }
}
