import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmailsService {
  constructor(private toastr: ToastrService, private http: HttpClient) { }

  asignarBeneficiariosAPersona(idPersona: number, idDetallePersona: number, beneficiarios: any[]): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/asignar-beneficiarios/${idPersona}/${idDetallePersona}`;
    return this.http.post<any>(url, beneficiarios).pipe(
      catchError(error => {
        console.error('Error al enviar correo:', error);
        return throwError(() => new Error('Error al enviar correo'));
      })
    );
  }

}
