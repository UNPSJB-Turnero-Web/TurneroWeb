// src/app/play-type/play-type.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { PlayType } from '../playType/playType';
import { DataPackage } from '../data.package';

@Injectable({
  providedIn: 'root'
})
export class PlayTypeService {
  private url = 'rest/playtype';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.url);
  }

  get(id: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/${id}`);
  }

  save(playType: PlayType): Observable<DataPackage> {
    return playType.id
      ? this.http.put<DataPackage>(this.url, playType)
      : this.http.post<DataPackage>(this.url, playType);
  }

  remove(id: number): Observable<any> {
    return this.http.delete(`${this.url}/${id}`);
  }

  byPage(page: number, size: number): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.url}/page?page=${page - 1}&size=${size}`);
  }

  search(term: string): Observable<PlayType[]> {
  return this.http.get<DataPackage>(`${this.url}/search/${term}`).pipe(
    map(dataPackage => dataPackage.data as PlayType[])
  );
}
}
