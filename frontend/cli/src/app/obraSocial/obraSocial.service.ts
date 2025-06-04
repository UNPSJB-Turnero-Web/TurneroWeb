import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ObraSocial } from './obraSocial';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class ObraSocialService {
  private url = 'rest/obra-social';

  constructor(private http: HttpClient) {}

  /** Obtiene todas las obras sociales */
  all(): Observable<DataPackage<ObraSocial[]>> {
    return this.http.get<DataPackage<ObraSocial[]>>(this.url);
  }

  /** Obtiene una obra social por ID */
  get(id: number): Observable<DataPackage<ObraSocial>> {
    return this.http.get<DataPackage<ObraSocial>>(`${this.url}/${id}`);
  }

  /** Crea una nueva obra social */
  create(obraSocial: ObraSocial): Observable<DataPackage<ObraSocial>> {
    return this.http.post<DataPackage<ObraSocial>>(this.url, obraSocial);
  }

  /** Actualiza una obra social existente */
  update(id: number, obraSocial: ObraSocial): Observable<DataPackage<ObraSocial>> {
    return this.http.put<DataPackage<ObraSocial>>(`${this.url}/${id}`, obraSocial);
  }

  /** Elimina una obra social por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /** Paginación de obras sociales */
  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }

  /** Búsqueda de obras sociales */
  search(term: string): Observable<DataPackage<ObraSocial[]>> {
    return this.http.get<DataPackage<ObraSocial[]>>(`${this.url}/search/${term}`);
  }
}