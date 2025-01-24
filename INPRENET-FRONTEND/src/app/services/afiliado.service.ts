import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {
  @Output() PersonasEdit: EventEmitter<any> = new EventEmitter();
  constructor(private http: HttpClient) { }

  generarConstanciaQR(data: any, dto: any, type: string): Observable<Blob> {
    const url = `${environment.API_URL}/api/documents/constancia-qr`;
    return this.http.post(
      url,
      { ...data, dto, type },
      { responseType: 'blob' }
    );
  }

  generarConstanciaAfiliacion2(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/documents/constancia-afiliacion2`;
    return this.http.post<any>(url, data);
  }

  createBeneficiarioConDetalle(personaData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/create-with-detalle`;
    return this.http.post<any>(url, personaData);
  }

  inactivarPersona(idPersona: number, idCausante: number): Observable<void> {
    const url = `${environment.API_URL}/api/Persona/inactivar/${idPersona}/${idCausante}`;
    return this.http.patch<void>(url, {});
  }

  getAllEstados(): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/obtenerEstados`;
    return this.http.get<any>(url);
  }

  updateBeneficiario(idPersona: number, updatedData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/actualizarBeneficiario/${idPersona}`;
    return this.http.put(url, updatedData);
  }

  buscarDetPersona(dni: string): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/causantes/${dni}`;
    return this.http.get<any[]>(url).pipe(
      map((res: any) => {
        let data = res?.data;
        return data.map((item: any) => ({
          ID_PERSONA: item.ID_PERSONA,
          ID_CAUSANTE: item.ID_CAUSANTE,
          ID_CAUSANTE_PADRE: item.ID_CAUSANTE_PADRE,
          ID_DETALLE_PERSONA: item.ID_DETALLE_PERSONA,
          ID_ESTADO_AFILIACION: item.ID_ESTADO_AFILIACION,
          dniCausante: item.DNI_CAUSANTE,
          tipoPersona: item.NOMBRE_TIPO_PERSONA || 'No disponible',
          estadoAfiliacion: item.ESTADO_AFILIACION || 'Sin estado',
          observacion: item.OBSERVACION || 'Sin observación'
        }));
      })
    );
  }

  buscarCuentasPorDNI(dni: string): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/cuentas/${dni}`;
    return this.http.get<any>(url);
  }

  obtenerTiposCuentas(): Observable<any> {
    const url = `${environment.API_URL}/api/Transacciones/tipos-de-cuenta/`;
    return this.http.get<any>(url);
  }

  getAllAfiliados(): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/Afiliado`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllReferenciasPersonales(dni: string): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/getAllReferenciasPersonales/${dni}`;

    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllFamiliares(dni: string): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/getAllFamiliares/${dni}`;

    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  updateDatosGenerales(idPersona: string, datosGenerales: any): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('datosGenerales', JSON.stringify(datosGenerales));
    if (datosGenerales.certificado_defuncion) {
      formData.append('arch_cert_def', datosGenerales.certificado_defuncion);
    }
    if (datosGenerales.dato && datosGenerales.archivo_identificacion) {
      formData.append('archivo_identificacion', datosGenerales.archivo_identificacion);
    }
    if (datosGenerales.FotoPerfil) {
      formData.append('FotoPerfil', datosGenerales.FotoPerfil);
    }
    return this.http.put(`${environment.API_URL}/api/Persona/updateDatosGenerales/${idPersona}`, formData);
  }

  updateReferenciaPersonal(id: string, updateDto: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/afiliacion/referencia/actualizar/${id}`, updateDto);
  }

  eliminarReferenciaPersonal(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/api/Persona/eliminarReferencia/${id}`);
  }

  eliminarColegioMagisterialPersona(id: string): Observable<any> {
    return this.http.delete(`${environment.API_URL}/api/Persona/eliminarColegioMagisterialPersona/${id}`);
  }

  updateVinculoFamiliar(dniPersona: string, dniFamiliar: string, updateData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/updateVinculoFamiliar/${dniPersona}/${dniFamiliar}`;
    return this.http.patch<any>(url, updateData);
  }

  getAllPerfCentroTrabajo(dni: string): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/getAllPerfCentroTrabajo/${dni}`;

    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllCargoPublicPeps(dni: string): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/getAllCargoPublicPeps/${dni}`;

    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllOtrasFuentesIngres(dni: string): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/getAllOtrasFuentesIngres/${dni}`;

    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  agregarFamiliar(dniPersona: string, familiarData: any): Observable<any> {
    return this.http.post(`${environment.API_URL}/api/Persona/agregarFamiliar/${dniPersona}`, familiarData);
  }

  updatePerfCentroTrabajo(id: number, encapsulatedData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/updatePerfCentroTrabajo/${id}`;
    return this.http.patch<any>(url, encapsulatedData);
  }

  updateDatosBancarios(idPerf: string, datosBancarios: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/Persona/updateDatosBancarios/${idPerf}`, datosBancarios);
  }

  desactivarPerfCentroTrabajo(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/desactivarPerfCentroTrabajo/${id}`;
    return this.http.patch(url, null);
  }

  desactivarCuentaBancaria(id: number): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/desactivarCuentaBancaria/${id}`;
    return this.http.put(url, null);
  }

  activarCuentaBancaria(id: number, id_persona: number): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/activarCuentaBancaria/${id}/${id_persona}`;
    return this.http.put(url, null);
  }

  getAfiliadoDNI(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/dni/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  findTipoPersonaByN_ident(n_identificacion: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/findTipoPersonaByN_ident/${n_identificacion}`;
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

  generar_voucher_by_mes(dni: string, mes: number, anio: number): Observable<any> {
    // Definir los parámetros de la consulta
    const params = new HttpParams()
      .set('dni', dni)
      .set('mes', mes)
      .set('anio', anio);

    return this.http.get<any>(`${environment.API_URL}/api/planilla/generar-voucher-by-mes`, { params });
  }

  getAfilByParam(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/Afiliado/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAfilByDni(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/Afil/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getPersonaParaDeduccion(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/personaParaDeduccion/${param}`;
    return this.http.get<any>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        console.error('Error al obtener persona para deducción:', error);
        const errorMessage = error.error?.mensaje || 'Error desconocido al buscar el afiliado.';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  getAllPersonaPBanco(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/getAllPersonaPBanco/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  getAllColMagPPersona(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/getAllColMagPPersona/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
      })
    );
  }

  /* BENEFICIARIOS PARA UN CAUSANTE FALLECIDO*/
  obtenerBenDeAfil(dniAfil: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/obtenerBenDeAfil/${dniAfil}`;
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
    const url = `${environment.API_URL}/api/Persona/getAllBenDeAfil/${dniAfil}`;
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

  getDesignadosOBeneficiariosPorCausante(dniCausante: string): Observable<any> {
    return this.http.get(`${environment.API_URL}/api/persona/causantes/${dniCausante}`);
  }

  updateEstadoAfiliacionPorDni(payload: { idPersona: number, idCausante: number, idCausantePadre: number, idDetallePersona: number, idEstadoAfiliacion: number, dniCausante: string; estadoAfiliacion: string; observacion: string }): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/updateEstadoAfiliacion`; // Asegúrate de que esta sea la URL correcta
    return this.http.put<any>(url, payload);
  }
}
