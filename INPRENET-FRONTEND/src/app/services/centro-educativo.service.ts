import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CentroEducativoService {
  // BehaviorSubjects para almacenar los datos de cada rol
  private administradorData = new BehaviorSubject<any>(null); // Datos del Administrador
  private contadorData = new BehaviorSubject<any>(null);      // Datos del Contador
  private propietarioData = new BehaviorSubject<any>(null);   // Datos del Propietario

  // Observables que otros componentes pueden suscribirse para recibir datos
  administradorData$ = this.administradorData.asObservable(); // Observable para los datos del Administrador
  contadorData$ = this.contadorData.asObservable();           // Observable para los datos del Contador
  propietarioData$ = this.propietarioData.asObservable();     // Observable para los datos del Propietario

  // Métodos para actualizar los datos de cada sección desde los subcomponentes
  // Actualizar datos del Administrador
  updateAdministradorData(data: any) {
    this.administradorData.next(data); // Envía nuevos datos a los suscriptores
  }
  // Actualizar datos del Contador
  updateContadorData(data: any) {
    this.contadorData.next(data); // Envía nuevos datos a los suscriptores
  }
  // Actualizar datos del Propietario
  updatePropietarioData(data: any) {
    this.propietarioData.next(data); // Envía nuevos datos a los suscriptores
  }
}