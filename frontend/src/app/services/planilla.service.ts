import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  constructor(private http: HttpClient) { }

  updatePlanilla(idPlanilla: string, planillaData: any): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/${idPlanilla}`;
    return this.http.put(url, planillaData).pipe(
      catchError(this.handleError)
    );
  }

  actualizarBeneficiosYDeducciones(detalles: { detallesBeneficios: any[], detallesDeducciones: any[] }): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/actualizar-transacciones`; // Asegúrate de que la ruta coincida con tu backend
    return this.http.post(url, detalles).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error.error);
    throw 'Error en la llamada HTTP';
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

    // Construye los parámetros de la consulta
/*     let params = new HttpParams()
      .set('term', codigo_planilla); */

    // Realiza la petición GET al backend con los parámetros
    return this.http.get(`${environment.API_URL}/api/planilla/${codigo_planilla}`);
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
}
