import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  private baseUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) { }

  // Método para crear una nueva TipoPlanilla
  createTipoPlanilla(tipoPlanillaData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tipo-planilla`, tipoPlanillaData);
  }

  findAllTipoPlanilla(limit: number = 10, offset: number = 0): Observable<any> {
    let params = new HttpParams()
      .set('limit', limit.toString())
      .set('offset', offset.toString());

    return this.http.get(`${this.baseUrl}/tipo-planilla`, { params });
  }

  // BehaviorSubject para almacenar y emitir los datos de los usuarios
  private usersSource = new BehaviorSubject<any[]>([]);
  currentUsers = this.usersSource.asObservable();


  uploadExcel(file: File): Observable<any> {
    const formData: FormData = new FormData();
    formData.append('excel', file, file.name);

    return this.http.post(`${this.baseUrl}/detalle-deduccion/upload`, formData);
  }

  // Método para actualizar los datos de los usuarios
  updateUsers(users: any[]) {
    this.usersSource.next(users);
  }
}
