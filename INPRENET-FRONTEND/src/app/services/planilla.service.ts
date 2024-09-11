import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable, BehaviorSubject, catchError, throwError, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  constructor(private http: HttpClient,private toastr: ToastrService) { }

  actualizarFallecidosDesdeExcel(file: File): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/update-fallecidos-from-excel`;
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(url, formData).pipe(
      catchError(error => {
        console.error('Error al subir el archivo Excel', error);
        this.toastr.error('Error al subir el archivo Excel');
        return throwError(error);
      })
    );
  }

  descargarReporteDetallePago(
    periodoInicio: string,
    periodoFinalizacion: string,
    idTiposPlanilla: number[]
  ): Observable<Blob> {
    const url = `${environment.API_URL}/api/planilla/generar-reporte-detalle-pago`;

    let params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion)
      .set('idTiposPlanilla', idTiposPlanilla.join(','));

    return this.http.get(url, { params, responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error al descargar el archivo Excel', error);
        this.toastr.error('Error al descargar el archivo Excel');
        return throwError(error);
      })
    );
  }

  updatePlanillaACerrada(codigo_planilla: string): Observable<void> {
    const url = `${environment.API_URL}/api/planilla/actualizar-planilla-a-cerrada`;
    return this.http.patch<void>(url, null, { params: { codigo_planilla } }).pipe(
      catchError(error => {
        console.error('Error al actualizar el estado de la planilla', error);
        this.toastr.error('Error al actualizar el estado de la planilla');
        return throwError(error);
      })
    );
  }

  getDesglosePorPersonaPlanilla(id_persona: string, codigo_planilla: string): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/desglose-persona-planilla`;
    return this.http.get<any>(url, { params: { id_persona, codigo_planilla } }).pipe(
      catchError(error => {
        console.error('Error al obtener desglose por persona', error);
        return throwError(error);
      })
    );
}

  getPlanillasActivas(clasePlanilla?: string): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/activas`;
    let params = new HttpParams();

    if (clasePlanilla) {
      params = params.set('clasePlanilla', clasePlanilla);
    }

    return this.http.get<any>(url, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener planillas activas', error);
        return throwError(error);
      })
    );
  }

  getPlanillasPreliminares(codigo_planilla: string): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/get-preliminares`;
    return this.http.post<any>(url, { codigo_planilla }).pipe(
      catchError(error => {
        console.error('Error al obtener planillas preliminares', error);
        return throwError(error);
      })
    );
  }

  generarPlanillaComplementaria(tiposPersona: string): Observable<void> {
    const url = `${environment.API_URL}/api/planilla/generar-complementaria`;
    return this.http.post<void>(url, { tipos_persona: tiposPersona }).pipe(
      catchError(error => {
        const errorMessage = error.error.message || 'Error al generar planilla complementaria';
        this.toastr.error(errorMessage);
        console.error('Error al generar planilla complementaria', error);
        return throwError(error);
      })
    );
  }

  generarPlanillaOrdinaria(tiposPersona: string): Observable<void> {
    const url = `${environment.API_URL}/api/planilla/generar-ordinaria`;
    return this.http.post<void>(url, { tipos_persona: tiposPersona }).pipe(
      catchError(error => {
        const errorMessage = error.error.message || 'Error al generar planilla ordinaria';
        this.toastr.error(errorMessage);
        console.error('Error al generar planilla ordinaria', error);
        return throwError(error);
      })
    );
  }

  getTotalesBeneficiosDeducciones(idPlanilla: number): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/totales-beneficios-deducciones/${idPlanilla}`;
    return this.http.get<any>(url).pipe(
      catchError(error => {
        console.error('Error al obtener los totales de beneficios y deducciones', error);
        return throwError(error);
      })
    );
  }

  getTotalBeneficiosYDeduccionesPorPeriodo(periodoInicio: string, periodoFinalizacion: string, idTiposPlanilla: number[]): Observable<any> {
    const params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion)
      .set('idTiposPlanilla', idTiposPlanilla.join(','));

    return this.http.get<any>(`${environment.API_URL}/api/planilla/beneficios-deducciones-periodo`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener beneficios y deducciones', error);
        return throwError(error);
      })
    );
  }

  getTotalMontosPorBancoYPeriodo(periodoInicio: string, periodoFinalizacion: string, idTiposPlanilla: number[]): Observable<any> {
    const params = new HttpParams()
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion)
      .set('idTiposPlanilla', idTiposPlanilla.join(','));

    return this.http.get<any>(`${environment.API_URL}/api/planilla/montos-banco-periodo`, { params }).pipe(
      catchError(error => {
        console.error('Error al obtener montos por banco en el periodo', error);
        return throwError(error);
      })
    );
  }

  getDesgloseDeduccionesDeBeneficioPorPlanilla(idPlanilla: number, idBeneficio: number): Observable<any> {
    return this.http.get<any>(`${environment.API_URL}/api/planilla/desglose-deducciones/${idPlanilla}/${idBeneficio}`);
  }

  getMontosPorBanco(term: string): Observable<any[]> {
    const url = `${environment.API_URL}/api/planilla/montos-banco/${term}`;
    return this.http.get<any[]>(url).pipe(
      catchError(error => {
        console.error('Error al obtener los montos por banco', error);
        return throwError(error);
      })
    );
  }

  generarExcelPlanilla(codPlanilla: string): Observable<Blob> {
    const params = new HttpParams().set('codPlanilla', codPlanilla);
    const url = `${environment.API_URL}/api/planilla/generar-excel`;
    return this.http.get(url, { params, responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error al generar el Excel de la planilla', error);
        return throwError(() => new Error('Error al generar el Excel de la planilla'));
      })
    );
  }

  generarExcelPlanillaInv(perI: string, perF: string): Observable<Blob> {
    /* const params = new HttpParams().
    set('perI', perI).
    set('perF', perF); */

    const url = `${environment.API_URL}/api/planilla/Definitiva/personas/ord/${perI}/${perF}`;

    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError(error => {
        console.error('Error al generar el Excel de la planilla', error);
        return throwError(() => new Error('Error al generar el Excel de la planilla'));
      })
    );
  }


  getDeduccionesPorPlanillaSeparadas(idPlanilla: number): Observable<{ deduccionesINPREMA: any[], deduccionesTerceros: any[] }> {
    const url = `${environment.API_URL}/api/planilla/deducciones-separadas/${idPlanilla}`;
    return this.http.get<{ deduccionesINPREMA: any[], deduccionesTerceros: any[] }>(url).pipe(
      catchError(error => {
        console.error('Error al obtener las deducciones separadas', error);
        return throwError(error);
      })
    );
}


  getTotalesPorDedYBen(idPlanilla: string): Observable<any> {
    const url = `${environment.API_URL}/api/planilla/totalesBYD/${idPlanilla}`;
    return this.http.get(url).pipe(
      catchError(this.handleError)
    );
  }

  private getRequestParams(dni: string, periodoInicio: string, periodoFinalizacion: string): HttpParams {
    return new HttpParams()
      .set('dni', dni)
      .set('periodoInicio', periodoInicio)
      .set('periodoFinalizacion', periodoFinalizacion);
  }

  getPagoDeduccionesOrdiBenef(dni: string, periodoInicio: string, periodoFinalizacion: string): Observable<any> {
    const params = this.getRequestParams(dni, periodoInicio, periodoFinalizacion);
    return this.http.get(`${environment.API_URL}/api/planilla/deduccion-ordinaria-benef`, { params }).pipe(
      catchError(error => throwError(() => new Error('Error al obtener los detalles de deducciones')))
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
    return this.http.post(`${environment.API_URL}/api/planilla`, tipoPlanillaData).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(() => error);
      })
    );
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

  getPlanillas(codPlanilla: string): Observable<any> {
    let params = new HttpParams()
      .set('codPlanilla', codPlanilla)
    return this.http.get(`${environment.API_URL}/api/planilla/todas`, { params });
  }

  getPlanillaPrelimiar(codPlanilla: string): Observable<any> {
    let params = new HttpParams()
      .set('codPlanilla', codPlanilla)
    return this.http.get(`${environment.API_URL}/api/planilla/ObtenerPreliminar`, { params });
  }

  getBeneficiosDefinitiva(idPlanilla: string, idPersona: string): Observable<any> {
    let params = new HttpParams()
      .set('idPersona', idPersona)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/detallesDefinitiva`, { params });
  }
  getDeduccionesDefinitiva(idPlanilla: string, idPersona: string): Observable<any> {
    let params = new HttpParams()
      .set('idPersona', idPersona)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/detalle-deduccion/detallesDefinitiva`, { params });
  }

  getBeneficiosPrelimiar(idPlanilla: string, idPersona: string): Observable<any> {
    let params = new HttpParams()
      .set('idPersona', idPersona)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/beneficio-planilla/detallesPreliminar`, { params });
  }

  getDeduccionesPrelimiar(idPlanilla: string, idPersona: string): Observable<any> {
    let params = new HttpParams()
      .set('idPersona', idPersona)
      .set('idPlanilla', idPlanilla)
    return this.http.get(`${environment.API_URL}/api/detalle-deduccion/detallesPreliminar`, { params });
  }

}
