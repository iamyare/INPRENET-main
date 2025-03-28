import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RnpService {

  private readonly apiUrl = `${environment.API_URL}/api/rnp`;

  constructor(private http: HttpClient) {}

  startDevice(filename: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/start-device`, { filename });
  }

  verificarHuella(numeroIdentidad: string, imageName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-huella`, { numeroIdentidad, imageName });
  }
}
