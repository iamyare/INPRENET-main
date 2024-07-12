import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AfiliacionService {

constructor(private http: HttpClient) { }

crearAfiliacion(datos: any, fotoPerfil: File): Observable<any> {
  const url = `${environment.API_URL}/api/afiliacion/crear`;
  const formData: FormData = new FormData();
  formData.append('datos', JSON.stringify(datos));
  formData.append('foto_perfil', fotoPerfil);

  return this.http.post<any>(url, formData);
}

}
