import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConasaService {

  private readonly baseUrl = `${environment.API_URL}/api/conasa`;

  constructor(private http: HttpClient) { }

  obtenerCategorias(): Observable<any> {
    const url = `${this.baseUrl}/categorias`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener las categorías', error);
        return throwError(error);
      })
    );
  }

  obtenerPlanes(): Observable<any> {
    const url = `${this.baseUrl}/planes`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener los planes', error);
        return throwError(error);
      })
    );
  }
  
}
