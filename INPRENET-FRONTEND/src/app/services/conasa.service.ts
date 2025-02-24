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

  obtenerConsultasMedicas(): Observable<any[]> {
    const url = `${this.baseUrl}/consultas-medicas`;

    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener consultas médicas', error);
        return throwError(() => error);
      })
    );
  }

  obtenerAfiliadosMesAnterior(): Observable<any> {
    const url = `${this.baseUrl}/afiliados-mes-anterior`;
    
    return this.http.get<any>(url).pipe(
      catchError((error) => {
        console.error('Error al obtener afiliados del mes anterior', error);
        return throwError(() => error);
      })
    );
  }

  subirFactura(tipoFactura: number, periodoFactura: string, archivoPdf: File): Observable<any> {
    const url = `${this.baseUrl}/subir-factura`;
    const formData = new FormData();
    formData.append('tipo_factura', tipoFactura.toString());
    formData.append('periodo_factura', periodoFactura);
    formData.append('archivo_pdf', archivoPdf);
    return this.http.post<any>(url, formData).pipe(
      catchError((error) => {
        console.error('Error al subir la factura', error);
        return throwError(() => error);
      })
    );
  }

  listarFacturas(tipoFactura: number): Observable<any[]> {
    const url = `${this.baseUrl}/listar-facturas?tipo=${tipoFactura}`;
    return this.http.get<any[]>(url).pipe(
      catchError((error) => {
        console.error('Error al listar facturas', error);
        return throwError(() => error);
      }),
    );
  }
  
  visualizarFactura(id: number): Observable<Blob> {
    const url = `${this.baseUrl}/visualizar-factura/${id}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error al visualizar la factura', error);
        return throwError(() => error);
      }),
    );
  }
  
  descargarFactura(id: number): Observable<Blob> {
    const url = `${this.baseUrl}/descargar-factura/${id}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((error) => {
        console.error('Error al descargar la factura', error);
        return throwError(() => error);
      }),
    );
  }
  
  eliminarFactura(id: number): Observable<any> {
    const url = `${this.baseUrl}/eliminar-factura/${id}`;
    return this.http.delete<any>(url).pipe(
      catchError((error) => {
        const mensajeError = error?.error?.message || 'Error al eliminar la factura.';
        return throwError(() => new Error(mensajeError));
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

  cancelarContrato(payload: { n_identificacion?: string; id_contrato?: number; motivo_cancelacion: string }): Observable<string> {
    const url = `${this.baseUrl}/cancelar-contrato`;
    return this.http.post<string>(url, payload, { responseType: 'text' as 'json' }).pipe(
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
