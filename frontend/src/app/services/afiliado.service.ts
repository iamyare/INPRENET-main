import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfiliadoService {
  @Output() PersonasEdit: EventEmitter<any> = new EventEmitter();
  constructor(private http: HttpClient, private router: Router) { }

  generarConstanciaAfiliacion(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/documents/constancia-afiliacion`;
    return this.http.post<any>(url, data);
  }

  generarConstanciaQR(data: any, type: string): Observable<Blob> {
    const url = `${environment.API_URL}/api/documents/constancia-qr`;
    return this.http.post(url, { ...data, type }, { responseType: 'blob' });
  }

  generarConstanciaRenunciaCap(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/documents/constancia-renuncia-cap`;
    return this.http.post<any>(url, data);
  }

  generarConstanciaNoCotizar(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/documents/constancia-no-cotizar`;
    return this.http.post<any>(url, data);
  }

  generarConstanciaDebitos(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/documents/constancia-debitos`;
    return this.http.post<any>(url, data);
  }

  generarConstanciaTiempoCotizarConMonto(data: any): Observable<any> {
    const url = `${environment.API_URL}/api/documents/constancia-tiempo-cotizar-con-monto`;
    return this.http.post<any>(url, data);
  }

  createPersonaWithDetailsAndWorkCenters(formData: FormData): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/afiliacion`;
    return this.http.post<any>(url, formData);
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

  createReferPersonales(idPersona: string, encapsulatedData: any): Observable<any> {
    const encapsulatedDataE = { referencias: encapsulatedData }
    const url = `${environment.API_URL}/api/Persona/createReferPersonales/${idPersona}`;
    return this.http.post<any>(url, encapsulatedDataE);
  }

  createColegiosMagisteriales(idPersona: string, encapsulatedData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/createColegiosMagisteriales/${idPersona}`;
    return this.http.post<any>(url, encapsulatedData);
  }
  createCentrosTrabajo(idPersona: string, encapsulatedData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/createCentrosTrabajo/${idPersona}`;
    return this.http.post<any>(url, encapsulatedData);
  }
  createDatosBancarios(idPersona: string, encapsulatedData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/createDatosBancarios/${idPersona}`;
    return this.http.post<any>(url, encapsulatedData);
  }

  createBeneficiarios(idPersona: string, encapsulatedData: any): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/createBeneficiarios/${idPersona}`;
    return this.http.post<any>(url, encapsulatedData);
  }

  buscarMovimientosPorDNI(dni: string): Observable<any> {
    const url = `${environment.API_URL}/api/Persona/movimientos/${dni}`;
    return this.http.get<any>(url);
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
    return this.http.put(`${environment.API_URL}/api/Persona/updateDatosGenerales/${idPersona}`, datosGenerales);
  }

  updateReferenciaPersonal(id: string, updateDto: any): Observable<any> {
    return this.http.patch(`${environment.API_URL}/api/Persona/updateReferenciaPerson/${id}`, updateDto);
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
  updateColegiosMagist(idPerf: string, datosColegioMagist: any): Observable<any> {
    return this.http.put(`${environment.API_URL}/api/Persona/updateColegiosMagist/${idPerf}`, datosColegioMagist);
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

  generarVoucher(idPlanilla: string, dni: string): Observable<any> {
    // Definir los parámetros de la consulta
    const params = new HttpParams()
      .set('idPlanilla', idPlanilla)
      .set('dni', dni);
    return this.http.get<any>(`${environment.API_URL}/api/planilla/generar-voucher`, { params });
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

  getAllPersonas(param: string | number): Observable<any | void> {
    const url = `${environment.API_URL}/api/Persona/${param}`;
    return this.http.get<any>(
      url,
    ).pipe(
      map((res: any) => {
        return res;
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

  agregarAfiliados(data: any): Observable<any> {
    var url = `${environment.API_URL}/Personas/agregarAfiliado`;

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

  agregDatosPuestTra(data: any, dnireferente: any): Observable<any> {
    var url = `${environment.API_URL}/Persona/createCentrosTrabPersona/${dnireferente}`;

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

  agregDatosRefPer(data: any, dnireferente: any): Observable<any> {
    var url = `${environment.API_URL}/Persona/createRefPers/${dnireferente}`;

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
}
