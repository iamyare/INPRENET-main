import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PersonaService {

  private personaSource = new BehaviorSubject<any>(null);
  currentPersona = this.personaSource.asObservable();

  constructor(private http: HttpClient) { }

  getPersonaByDni(n_identificacion: string): Observable<any> {
    const url = `${environment.API_URL}/api/afiliacion/persona-dni/${n_identificacion}`;
    return this.http.get<any>(url);
  }

  getCausantesBy_n_identificacionBeneficiario(n_identificacion: string): Observable<any[]> {
    const url = `${environment.API_URL}/api/afiliacion/causantes/${n_identificacion}`;
    return this.http.get<any[]>(url);
  }

  changePersona(persona: any) {
    this.personaSource.next(persona);
  }
}
