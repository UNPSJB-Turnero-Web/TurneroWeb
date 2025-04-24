import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { Customer } from './customer';


@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private customersUrl = 'rest/customer';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.customersUrl);
  }

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.customersUrl}/${id}`);
  }

  save(customer: Customer): Observable<DataPackage> {
    return customer.id
      ? this.http.put<DataPackage>(this.customersUrl, customer)
      : this.http.post<DataPackage>(this.customersUrl, customer);
  }

  remove(id: number): Observable<DataPackage> {
    return this.http.delete<DataPackage>(`${this.customersUrl}/${id}`);
  }

  search(term: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.customersUrl}/search/${term}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.customersUrl}/page?page=${page - 1}&size=${size}`);
  }
}
