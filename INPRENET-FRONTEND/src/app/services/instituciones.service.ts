import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InstitucionesService {

  constructor(private http: HttpClient) { }

  getInstituciones(): Observable<any>{
    var url= `${environment.API_URL}/api/centro-trabajo`;

    return this.http.get(url,
      ).pipe(
        map((res:any) => {
          return res;
        }),
      );
  }
}
