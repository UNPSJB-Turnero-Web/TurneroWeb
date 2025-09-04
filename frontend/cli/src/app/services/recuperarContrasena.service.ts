import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class RecuperarContrasenaService {
  private base = "/api/auth"; // ajustar según backend
  constructor(private http: HttpClient) {}

  requestReset(email: string): Observable<any> {
    return this.http.post(`${this.base}/forgot-password`, { email });
  }
}
