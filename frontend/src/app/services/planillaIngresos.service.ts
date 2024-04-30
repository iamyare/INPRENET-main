import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillaIngresosService {

  constructor(private http: HttpClient) { }

  eliminarDetallePlanillaIngreso(idDetallePlanIngreso: number): Observable<{ message: string }> {
    const url = `${environment.API_URL}/api/detalle-plan-ingr/eliminar/${idDetallePlanIngreso}`;
    return this.http.patch<{ message: string }>(url, null);
  }

  actualizarDetallesPlanillaPrivada(dni: string, idDetallePlanIngreso: number, sueldo: number, prestamos?: number): Observable<{ message: string }> {
    const url = `${environment.API_URL}/api/detalle-plan-ingr/actualizar-detalles-planilla-privada`;
    return this.http.put<{ message: string }>(url, { dni, idDetallePlanIngreso, sueldo, prestamos });
}

  actualizarSalarioBase(dni: string, idCentroTrabajo: number, salarioBase: number): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/actualizar-salario`;
    return this.http.put(url, { dni, idCentroTrabajo, salarioBase });
  }

  obtenerDetallesPorCentroTrabajo(idCentroTrabajo: number, id_tipo_planilla: number): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-plan-ingr/obtenerDetalleIngresos/${idCentroTrabajo}/${id_tipo_planilla}`;
    return this.http.get<any>(url);
  }

  obtenerPlanillaSeleccionada(idCentroTrabajo: number, id_tipo_planilla: number): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-plan-ingr/obtenerPlanillaSeleccionada/${idCentroTrabajo}/${id_tipo_planilla}`;
    return this.http.get<any>(url);
  }

  obtPersonaPorCentTrab(dni: string, id_centro_trabajo: number): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-plan-ingr/obtPersonaPorCentTrab/${dni}/${id_centro_trabajo}`;
    return this.http.get<any>(url);
  }

  obtenerDetallesPlanillaAgrupCent(idCentroTrabajo: number, id_tipo_planilla: number): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-plan-ingr/obtenerDetalleIngresosAgrupCent/${idCentroTrabajo}/${id_tipo_planilla}`;
    return this.http.get<any>(url);
  }

  agregarDetallesPlanillaAgrupCent(id_planilla: number, dni: string, id_centro_educativo: number, data: any): Observable<any> {
    let params = new HttpParams()
      .set('id_planilla', id_planilla)
      .set('dni', dni)
      .set('id_centro_educativo', id_centro_educativo)

    return this.http.post(`${environment.API_URL}/api/detalle-plan-ingr/${id_planilla}/${dni}/${id_centro_educativo}`, data);
  }
}

