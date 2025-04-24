import { Injectable } from '@angular/core';
import { Play } from './play';
import { Observable } from 'rxjs';
import { DataPackage } from '../data.package';
import { HttpClient } from '@angular/common/http';
import { PlayType } from '../playType/playType';

@Injectable({
  providedIn: 'root'
})
export class PlayService {

  private playsUrl = 'rest/plays';

  constructor(private http: HttpClient) {}

  all(): Observable<DataPackage> {
    return this.http.get<DataPackage>(this.playsUrl);
  }

  get(code: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.playsUrl}/code/${code}`);
  }

  save(play: Play): Observable<DataPackage> {
    return play.id 
    ? this.http.put<DataPackage>(this.playsUrl, play)
    : this.http.post<DataPackage>(this.playsUrl, play);
  }

  

  getTypes(): Observable<PlayType[]> {
    return this.http.get<PlayType[]>(`${this.playsUrl}/types`);
  }

  delete(code: string): Observable<void> {
    return this.http.delete<void>(`${this.playsUrl}/code/${code}`);
  }
  byPage(page: number, size: number): Observable<DataPackage>{
    return this.http.get<DataPackage>(`${this.playsUrl}/page?page=${page-1}&size=${size}`)
  }

  search(searchTerm: string): Observable<DataPackage> {
    return this.http.get<DataPackage>(`${this.playsUrl}/search/${searchTerm}`);
  }

}
