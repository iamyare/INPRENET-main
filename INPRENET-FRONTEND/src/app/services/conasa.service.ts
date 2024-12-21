import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConasaService {

  private readonly baseUrl = `${environment.API_URL}/api/conasa`;

  constructor(private http: HttpClient) { }

  subirFactura(tipoFactura: number, periodoFactura: string, archivoPdf: File): Observable<any> {
    const url = `${this.baseUrl}/subir-factura`;

    const formData = new FormData();
    formData.append('tipo_factura', tipoFactura.toString()); // Convertir explícitamente a string
    formData.append('periodo_factura', periodoFactura);
    formData.append('archivo_pdf', archivoPdf);

    return this.http.post<any>(url, formData).pipe(
      catchError((error) => {
        console.error('Error al subir la factura', error);
        return throwError(() => error);
      })
    );
  }



  obtenerCategorias(): Observable<any> {
    const url = `${this.baseUrl}/categorias`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener las categorías', error);
        return throwError(error);
      })
    );
  }

  obtenerPlanes(): Observable<any> {
    const url = `${this.baseUrl}/planes`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener los planes', error);
        return throwError(error);
      })
    );
  }

  crearContrato(payload: any): Observable<any> {
    const url = `${this.baseUrl}/crear-contrato`;
    return this.http.post<any>(url, payload).pipe(
      catchError((error) => {
        console.error('Error al crear contrato', error);
        return throwError(() => error);
      })
    );
  }

  obtenerContratoYBeneficiariosPorDNI(dni: string): Observable<any> {
    const url = `${this.baseUrl}/titular/${dni}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error(`Error al obtener contrato y beneficiarios para el DNI: ${dni}`, error);
        return throwError(error);
      })
    );
  }

  verificarContrato(idPersona: number): Observable<any> {
    const url = `${this.baseUrl}/verificar-contrato/${idPersona}`;
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al verificar contrato', error);
        return throwError(() => error);
      })
    );
  }

  cancelarContrato(payload: { n_identificacion?: string; id_contrato?: number; motivo_cancelacion: string }): Observable<any> {
    const url = `${this.baseUrl}/cancelar-contrato`;
    return this.http.post<any>(url, payload).pipe(
      catchError((error) => {
        console.error('Error al cancelar contrato', error);
        return throwError(() => error);
      })
    );
  }

  descargarAfiliadosPorPeriodoExcel(fechaInicio: string, fechaFin: string) {
    const url = `${this.baseUrl}/afiliados-por-periodo-excel?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error al descargar el Excel de afiliados por periodo', error);
        throw error;
      })
    );
  }

  descargarBeneficiariosExcel() {
    const url = `${this.baseUrl}/beneficiarios/excel`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error al descargar el Excel de beneficiarios', error);
        throw error;
      })
    );
  }

}
