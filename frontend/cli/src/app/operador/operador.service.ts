import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { map, Observable } from "rxjs";
import { Operador } from "./operador";
import { DataPackage } from "../data.package";
import { ResultsPage } from "../results-page";

@Injectable({
  providedIn: "root",
})
export class OperadorService {
  private url = "rest/operadores";

  constructor(private http: HttpClient) {}

  /** Obtiene todos los operadores */
  all(): Observable<DataPackage<Operador[]>> {
    return this.http.get<DataPackage<Operador[]>>(this.url);
  }

  /** Obtiene un operador por ID */
  get(id: number): Observable<DataPackage<Operador>> {
    return this.http.get<DataPackage<Operador>>(`${this.url}/${id}`);
  }

  /** Crea un nuevo operador */
  create(operador: Operador): Observable<DataPackage<Operador>> {
    return this.http.post<DataPackage<Operador>>(this.url, operador);
  }

  /** Actualiza un operador existente */
  update(id: number, operador: Operador): Observable<DataPackage<Operador>> {
    return this.http.put<DataPackage<Operador>>(`${this.url}/${id}`, operador);
  }

  /** Elimina un operador por ID */
  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  /** Obtiene operadores por página */
  byPage(page: number, size: number): Observable<DataPackage<ResultsPage>> {
    return this.http.get<DataPackage<ResultsPage>>(
      `${this.url}/page?page=${page - 1}&size=${size}`
    );
  }

  /** Verifica si un operador existe por DNI */
  existsByDni(dni: number): Observable<boolean> {
    return this.http
      .get<DataPackage<boolean>>(`${this.url}/existsByDni/${dni}`)
      .pipe(map((res) => res.data || false));
  }

  /** Busca un operador por DNI */
  findByDni(dni: number): Observable<DataPackage<Operador>> {
    return this.http.get<DataPackage<Operador>>(`${this.url}/dni/${dni}`);
  }

  /** Busca un operador por username y obtiene su ID */
  findByUsername(
    username: string
  ): Observable<DataPackage<{ operadorId: number }>> {
    return this.http.get<DataPackage<{ operadorId: number }>>(
      `${this.url}/by-username/${username}`
    );
  }
}
