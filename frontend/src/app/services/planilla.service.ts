import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  constructor(private http: HttpClient) { }

  updatePlanilla(idPlanilla: string, datosActualizados: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/planilla/${idPlanilla}`, datosActualizados).pipe(
      catchError(error => {
        console.error('Error al actualizar la planilla', error);
        return throwError(() => new Error('Error al actualizar la planilla'));
      })
    );
  }

  actualizarBeneficiosYDeducciones(detalles: { detallesBeneficios: any[], detallesDeducciones: any[] }): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/actualizar-transacciones`;
    return this.http.post(url, detalles).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error.error);
    throw 'Error en la llamada HTTP';
  }

  getTotalesPorDedYBen(idPlanilla: string): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/totalesBYD/${idPlanilla}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  obtenerTotalPlanilla(idPlanilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/planilla/total/${idPlanilla}`).pipe(
      catchError(this.handleError)
    );
  }


  // Método para crear una nueva TipoPlanilla
  createTipoPlanilla(tipoPlanillaData: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/tipo-planilla`, tipoPlanillaData);
  }

  createPlanilla(tipoPlanillaData: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/planilla`, tipoPlanillaData);
  }

  findAllTipoPlanilla(limit: number = 10, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${environment.API_URL}/api/tipo-planilla`, { params });
  }

  findAllPlanillas(limit: number = 10, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${environment.API_URL}/api/planilla`, { params });
  }

/*   getDeduccionesNoAplicadas(periodoInicio: string, periodoFinalizacion: string): Observable<any> {

    // Construye los parámetros de la consulta
    let params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);

    // Realiza la petición GET al backend con los parámetros
    return this.http.get(`${environment.API_URL}/api/planilla/deducciones-no-aplicadas`, { params });
  } */

  getDatosOrdinaria(periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    let params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/planillaOrdinaria`, { params });
  }



  getDatosComplementaria(periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    /* let params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);
 */
    return this.http.get(`${environment.API_URL}/api/planilla/planillaComplementaria`);
  }

  getDatosExtraordinaria(periodoInicio: string, periodoFinalizacion: string): Observable<any> {
/*     let params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion); */

    return this.http.get(`${environment.API_URL}/api/planilla/planillaExtraordinaria`);
  }

  getPlanillaBy(codigo_planilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/planilla/${codigo_planilla}`);
  }

  getPlanillaDefin(codigo_planilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/planilla/Definitiva/${codigo_planilla}`);
  }

  getBeneficiosNoAplicadas(periodoInicio: string, periodoFinalizacion: string): Observable<any> {

    // Construye los parámetros de la consulta
    let params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);

    // Realiza la petición GET al backend con los parámetros
    return this.http.get(`${environment.API_URL}/api/planilla/beneficios-no-aplicadas`, { params });
  }

  updateTipoPlanilla(id: string, tipoPlanillaData: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/tipo-planilla/${id}`, tipoPlanillaData);
  }

  // BehaviorSubject para almacenar y emitir los datos de los usuarios
  private usersSource = new BehaviorSubject<any[]>([]);
  currentUsers = this.usersSource.asObservable();


  uploadExcel(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('excel', file, file.name);

    return this.http.post(`${environment.API_URL}/api/planilla/detalle-deduccion/upload`, formData);
  }

  // Método para actualizar los datos de los usuarios
  updateUsers(users: any[]) {
    this.usersSource.next(users);
  }


  getPlanillaPrelimiar(idPlanilla: string): Observable<any> {
    let params = new HttpParams()
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/planilla/preliminar`, { params });
  }

  getBeneficiosPrelimiar(idPlanilla: string, idAfiliado: string): Observable<any> {
    let params = new HttpParams()
      .set('idAfiliado', idAfiliado)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/detallesPreliminar`, { params });
  }
  getDeduccionesPrelimiar(idPlanilla: string, idAfiliado: string): Observable<any> {
    let params = new HttpParams()
      .set('idAfiliado', idAfiliado)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/detalle-deduccion/detallesPreliminar`, { params });
  }
}
