import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class FormStateService {
  private formData = new BehaviorSubject<FormGroup | null>(null);
  private forms: Map<string, FormGroup> = new Map();
  private fotoPerfil = new BehaviorSubject<string | null>(null);

  setFormData(form: FormGroup) {
    this.formData.next(form);
  }

  getFormData(): BehaviorSubject<FormGroup | null> {
    return this.formData;
  }

  setForm(key: string, form: FormGroup) {
    this.forms.set(key, form);
  }

  getForm(key: string): FormGroup | undefined {
    return this.forms.get(key);
  }

  setFotoPerfil(imagen: string) {
    this.fotoPerfil.next(imagen);
  }

  getFotoPerfil(): BehaviorSubject<string | null> {
    return this.fotoPerfil;
  }

}
