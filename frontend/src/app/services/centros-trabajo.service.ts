import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CentrosTrabajoService {
  constructor(private http: HttpClient, private router: Router) { }

  getCentroTrabajoById(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/centro-trabajo/${id}`;
    return this.http.get<any>(url);
  }

  getAllCentrosTrabajo(): Observable<any> {
    const url = `${environment.API_URL}/api/transacciones/getAllCentrosTrabajo`;
    return this.http.get<any[]>(url);
  }

}
