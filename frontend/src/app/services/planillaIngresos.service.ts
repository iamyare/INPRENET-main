import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PlanillaIngresosService {

  constructor(private http: HttpClient) { }

  obtenerDetallesPorCentroTrabajo(idCentroTrabajo: number, id_tipo_planilla: number): Observable<any> {
    const url = `${environment.API_URL}/api/detalle-plan-ingr/obtenerDetalleIngresos/${idCentroTrabajo}/${id_tipo_planilla}`;
    return this.http.get<any>(url);
  }

}

