import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {

  constructor(private http: HttpClient, private router: Router) { }

  getAllAfiliados(): Observable<any> {
    const url = `${environment.API_URL}/afiliados`;
    return this.http.get<any>(url);
  }

  agregDatosGen(data:any): Observable<any>{
    var url = `${environment.API_URL}/auth/signup`;
    console.log(data);

    return this.http.post<any>(
      url,
      data,
      ).pipe(
        map((res:any) => {
          return res;
        }),
        //catchError((err) => this.handlerError2(err))
      )
  }

  agregDatosBanc(data:any): Observable<any>{
    var url = `${environment.API_URL}/auth/signup`;
    console.log(data);

    return this.http.post<any>(
      url,
      data,
      ).pipe(
        map((res:any) => {
          return res;
        }),
        //catchError((err) => this.handlerError2(err))
      )
  }

  agregDatosPuestTra(data:any): Observable<any>{
    var url = `${environment.API_URL}/auth/signup`;
    console.log(data);

    return this.http.post<any>(
      url,
      data,
      ).pipe(
        map((res:any) => {
          return res;
        }),
        //catchError((err) => this.handlerError2(err))
      )
  }

  agregDatosRefPer(data:any): Observable<any>{
    var url = `${environment.API_URL}/auth/signup`;
    console.log(data);

    return this.http.post<any>(
      url,
      data,
      ).pipe(
        map((res:any) => {
          return res;
        }),
        //catchError((err) => this.handlerError2(err))
      )
  }
}
