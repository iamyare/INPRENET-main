import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, catchError, throwError, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  constructor(private http: HttpClient) { }

  actualizarPlanillaAPreliminar(tipo: string, idPlanilla: string, periodoInicio: string, periodoFinalizacion: string): Observable<string> {
    const url = `${environment.API_URL}/api/planilla/actualizar-planilla`;
    const body = { tipo, idPlanilla, periodoInicio, periodoFinalizacion };
    return this.http.post<string>(url, body, { responseType: 'text' as 'json' }).pipe(
      catchError(error => {
        console.error('Error al actualizar la planilla', error);
        return throwError(() => new Error('Error al actualizar la planilla'));
      })
    );
  }

  getPlanillaOrdinariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);

    return this.http.get(`${environment.API_URL}/api/planilla/ordinaria-afiliado`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener las planilla ordinaria para afiliados', error);
        return throwError(() => new Error('Error al obtener la planilla ordinaria para afiliados'));
      })
    );
  }

  getPlanillaOrdinariaBeneficiarios(periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);

    return this.http.get(`${environment.API_URL}/api/planilla/ordinaria-beneficiario`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener las planilla ordinaria para beneficiarios', error);
        return throwError(() => new Error('Error al obtener la planilla ordinaria para beneficiarios'));
      })
    );
  }

  getPlanillaComplementariaAfiliados(periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);

    return this.http.get(`${environment.API_URL}/api/planilla/complementaria-afiliado`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener las planilla complementaria para afiliados', error);
        return throwError(() => new Error('Error al obtener las planilla complementaria para afiliados'));
      })
    );
  }

  getPlanillaComplementariaBeneficiarios(periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);

    return this.http.get(`${environment.API_URL}/api/planilla/complementaria-beneficiario`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener las planilla complementaria para Beneficiarios', error);
        return throwError(() => new Error('Error al obtener las planilla complementaria para Beneficiarios'));
      })
    );
  }

  private getRequestParams(dni: string, periodoInicio: string, periodoFinalizacion: string): HttpParams {
    return new HttpParams()
      .set('dni', dni)
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);
  }

  getPagoBeneficioCompleBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/beneficios-complementaria-benef`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener el detalle del pago de beneficio')))
    );
  }

  getPagoDeduccionesCompleBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/deducciones-complementaria-benef`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener el detalle de deducciones de beneficio')))
    );
  }

  getPagoBeneficioCompleAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/beneficios-complementaria-afil`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener los detalles de pagos de beneficios')))
    );
  }

  getPagoDeduccionesCompleAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/deducciones-complementaria-afil`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener las deducciones específicas')))
    );
  }

  getPagoBeneficioOrdiBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/beneficios-ordinaria-benef`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener los detalles de pagos')))
    );
  }

  getPagoDeduccionesOrdiBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/deduccion-ordinaria-benef`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener los detalles de deducciones')))
    );
  }

  getPagoBeneficioOrdiAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/beneficios-ordinaria-afil`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener el monto a pagar por beneficio')))
    );
  }

  getPagoDeduccionesOrdiAfil(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/deduccion-ordinaria-afil`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener el monto por deducciones')))
    );
  }

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

  findTipoPlanillaByclasePlanilla(clasePlanilla: string, limit: number = 10, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    // Aquí agregamos el parámetro "clasePlanilla" al cuerpo de la solicitud
    const body = { clasePlanilla };

    return this.http.post(`${environment.API_URL}/api/tipo-planilla/findTipoPlanByclasePlan`, body, { params });
  }

  findAllPlanillas(limit: number = 10, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${environment.API_URL}/api/planilla`, { params });
  }

  getPlanillaBy(codigo_planilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/planilla/${codigo_planilla}`);
  }

  getPlanillaDefin(codigo_planilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/planilla/Definitiva/${codigo_planilla}`);
  }

  getPersPlanillaDefin(codigo_planilla: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/planilla/Definitiva/personas/${codigo_planilla}`);
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

  getPlanillaPrelimiar(codPlanilla: string): Observable<any> {
    let params = new HttpParams()
      .set('codPlanilla', codPlanilla)
    return this.http.get(`${environment.API_URL}/api/planilla/preliminar`, { params });
  }
  getPlanillas(codPlanilla: string): Observable<any> {
    let params = new HttpParams()
      .set('codPlanilla', codPlanilla)
    return this.http.get(`${environment.API_URL}/api/planilla/todas`, { params });
  }

  getBeneficiosDefinitiva(idPlanilla: string, idAfiliado: string): Observable<any> {
    let params = new HttpParams()
      .set('idAfiliado', idAfiliado)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/detallesDefinitiva`, { params });
  }
  getDeduccionesDefinitiva(idPlanilla: string, idAfiliado: string): Observable<any> {
    let params = new HttpParams()
      .set('idAfiliado', idAfiliado)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/detalle-deduccion/detallesDefinitiva`, { params });
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
