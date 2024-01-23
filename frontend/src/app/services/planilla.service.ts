import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanillaService {
  private baseUrl = 'http://localhost:3000/api';


  // Método para crear una nueva TipoPlanilla
  createTipoPlanilla(tipoPlanillaData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tipo-planilla`, tipoPlanillaData);
  }

  // BehaviorSubject para almacenar y emitir los datos de los usuarios
  private usersSource = new BehaviorSubject<any[]>([]);
  currentUsers = this.usersSource.asObservable();

  constructor(private http: HttpClient) { }

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
