import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private formData = new BehaviorSubject<FormGroup | null>(null);
  private forms: Map<string, FormGroup> = new Map();
  private fotoPerfilSource = new BehaviorSubject<string | null>(null); // Fuente para la foto de perfil

  // Configurar datos del formulario principal
  setFormData(form: FormGroup): void {
    this.formData.next(form);
  }

  // Obtener datos del formulario principal
  getFormData(): BehaviorSubject<FormGroup | null> {
    return this.formData;
  }

  // Configurar un formulario identificado por una clave
  setForm(key: string, form: FormGroup): void {
    this.forms.set(key, form);
  }

  // Obtener un formulario identificado por una clave
  getForm(key: string): FormGroup | undefined {
    return this.forms.get(key);
  }

  // Configurar la foto de perfil
  setFotoPerfil(foto: string): void {
    this.fotoPerfilSource.next(foto);
  }

  // Obtener la foto de perfil como un observable
  getFotoPerfil() {
    return this.fotoPerfilSource.asObservable();
  }

  // Reiniciar la foto de perfil
  resetFotoPerfil(): void {
    this.fotoPerfilSource.next(null); // Reiniciar el estado de la foto
  }
}
