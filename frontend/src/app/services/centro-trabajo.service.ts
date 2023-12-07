import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CentroTrabajoService {


  constructor(private http: HttpClient, private router: Router) { }

  getCentrosTrabajo(): Observable<any> {
    var url = `${environment.API_URL}/centrosTrabajo`
    return this.http.get<any>(url);
  }


}
