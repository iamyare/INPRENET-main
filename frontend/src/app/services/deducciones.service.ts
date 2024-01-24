import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DeduccionesService {

  private baseUrl = 'http://localhost:3000/api/';

  constructor(private http: HttpClient) { }

  getDetalleDeduccion(): Observable<any> {
    return this.http.get<any>(this.baseUrl + 'detalle-deduccion');
  }

  getDeducciones(): Observable<any>{
    var url= `${environment.API_URL}/api/deduccion`;

    return this.http.get(url,
      ).pipe(
        map((res:any) => {
          return res;
        }),
      );
  }

  updateDeduccion(id: string, deduccionData: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/deduccion/${id}`, deduccionData);
  }
}
