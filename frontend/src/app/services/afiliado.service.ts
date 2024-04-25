import { HttpClient, HttpParams } from '@angular/common/http';
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

  buscarMovimientosPorDNI(dni: string): Observable<any> {
    const url = `${environment.API_URL}/api/afiliado/movimientos/${dni}`;
    return this.http.get<any>(url);
  }

  getAllAfiliados(): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllReferenciasPersonales(dni:string): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado/getAllReferenciasPersonales/${dni}`;

    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  updateReferenciaPersonal(id: string, referPersData: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/afiliado/updateReferenciaPerson/${id}`, referPersData);
  }

  getAllPerfCentroTrabajo(dni:string): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado/getAllPerfCentroTrabajo/${dni}`;
    
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  updatePerfCentroTrabajo(id: string, PerfCentTrabData: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/afiliado/updatePerfCentroTrabajo/${id}`, PerfCentTrabData);
  }

  getAfiliadoDNI(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado/dni/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  generarVoucher(idPlanilla: string, dni: string): Observable<any> {
    // Definir los parámetros de la consulta
    const params = new HttpParams()
      .set('idPlanilla', idPlanilla)
      .set('dni', dni);
    return this.http.get<any>(`${environment.API_URL}/api/planilla/generar-voucher`, { params });
  }

  getAfilByParam(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  agregarAfiliados(data: any): Observable<any> {
    var url = `${environment.API_URL}/afiliados/agregarAfiliado`;

    return this.http.post<any>(
      url,
      data,
    ).pipe(
      map((res: any) => {
        return res;
      })
    )
  }

  agregDatosGen(data: any): Observable<any> {
    var url = `${environment.API_URL}/auth/signup`;

    return this.http.post<any>(
      url,
      data,
    ).pipe(
      map((res: any) => {
        return res;
      }),
      //catchError((err) => this.handlerError2(err))
    )
  }

  agregDatosBanc(data: any): Observable<any> {
    var url = `${environment.API_URL}/auth/signup`;

    return this.http.post<any>(
      url,
      data,
    ).pipe(
      map((res: any) => {
        return res;
      }),
      //catchError((err) => this.handlerError2(err))
    )
  }

  agregDatosPuestTra(data: any,dnireferente:any): Observable<any> {
    var url = `${environment.API_URL}/afiliado/createCentrosTrabPersona/${dnireferente}`;

    return this.http.post<any>(
      url,
      data,
    ).pipe(
      map((res: any) => {
        return res;
      }),
      //catchError((err) => this.handlerError2(err))
    )
  }

  agregDatosRefPer(data: any,dnireferente:any): Observable<any> {
    var url = `${environment.API_URL}/afiliado/createRefPers/${dnireferente}`;

    return this.http.post<any>(
      url,
      data,
    ).pipe(
      map((res: any) => {
        return res;
      }),
      //catchError((err) => this.handlerError2(err))
    )
  }

  agregDatosBeneficiarios(data: any): Observable<any> {
    var url = `${environment.API_URL}/auth/signup`;

    return this.http.post<any>(
      url,
      data,
    ).pipe(
      map((res: any) => {
        return res;
      }),
      //catchError((err) => this.handlerError2(err))
    )
  }

  /* BENEFICIARIOS PARA UN CAUSANTE FALLECIDO*/
  obtenerBenDeAfil(dniAfil: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado/obtenerBenDeAfil/${dniAfil}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  /* BENEFICIARIOS PARA UN CAUSANTE SIN IMPORTAR SI ESTA ACTIVO O FALLECIDO*/
  getAllBenDeAfil(dniAfil: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/afiliado/getAllBenDeAfil/${dniAfil}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  /* BENEFICIOS */
  obtenerBeneficiosDeAfil(dniAfil: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/beneficio-planilla/obtenerBeneficiosDeAfil/${dniAfil}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }
}
