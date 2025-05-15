import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { StaffMedico } from './staffmedico';

@Injectable({
  providedIn: 'root'
})
export class StaffMedicoService {
  private staffMedicoUrl = 'rest/staffMedico';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.staffMedicoUrl);
  }

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.staffMedicoUrl}/${id}`);
  }

  save(staffMedico: StaffMedico): Observable<DataPackage> {
    return staffMedico.id
      ? this.http.put<DataPackage>(this.staffMedicoUrl, staffMedico)
      : this.http.post<DataPackage>(this.staffMedicoUrl, staffMedico);
  }

  remove(id: number): Observable<DataPackage> {
    return this.http.delete<DataPackage>(`${this.staffMedicoUrl}/${id}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.staffMedicoUrl}/page?page=${page - 1}&size=${size}`);
  }
}