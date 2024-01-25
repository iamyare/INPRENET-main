import { HttpClient } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {

  @Output() afiliadosEdit: EventEmitter<any> = new EventEmitter();

  constructor(private http: HttpClient, private router: Router) { }

  getAllAfiliados(): Observable<any | void> {
    const url = `${environment.API_URL}/afiliados`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }

  getAfilByParam(param:string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado/${param}`;
    return this.http.get<any>(
      url,
      ).pipe(
        map((res:any) => {
          return res;
        })
      );
  }

  agregarAfiliados(data:any): Observable<any>{
    var url = `${environment.API_URL}/afiliados/agregarAfiliado`;

    return this.http.post<any>(
      url,
      data,
      ).pipe(
        map((res:any) => {
          return res;
        })
      )
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

  agregDatosBeneficiarios(data:any): Observable<any>{
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
