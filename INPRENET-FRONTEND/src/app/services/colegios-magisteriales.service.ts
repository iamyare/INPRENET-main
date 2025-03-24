import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ColegiosMagisterialesService {

  constructor(private http: HttpClient, private router: Router) { }

  getAllColegiosMagisteriales(): Observable<any> {
    const url = `${environment.API_URL}/api/transacciones/getAllColegiosMagisteriales`;
    return this.http.get<any[]>(url);
  }
}
