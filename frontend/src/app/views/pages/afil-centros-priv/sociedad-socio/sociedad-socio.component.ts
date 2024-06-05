import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl, FormControl } from '@angular/forms';
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-sociedad-socio',
  templateUrl: './sociedad-socio.component.html',
  styleUrls: ['./sociedad-socio.component.scss']
})
export class SociedadSocioComponent implements OnInit {
  @Input() parentForm!: FormGroup;

  fields: FieldArrays[] = [
    { name: 'nombreSociedad', label: 'Nombre de la Sociedad', icon: 'business', layout: { row: 0, col: 4 }, type: 'text', value: '', validations: [] },
    { name: 'rtn', label: 'RTN', icon: 'badge', layout: { row: 0, col: 4 }, type: 'text', value: '', validations: [] },
    { name: 'telefonoSociedad', label: 'Teléfono de la Sociedad', icon: 'phone', layout: { row: 0, col: 4 }, type: 'text', value: '', validations: [] },
    { name: 'correoSociedad', label: 'Correo de la Sociedad', icon: 'email', layout: { row: 1, col: 12 }, type: 'text', value: '', validations: [Validators.email] },
    { name: 'nombreSocio', label: 'Nombre del Socio', icon: 'person', layout: { row: 2, col: 6 }, type: 'text', value: '', validations: [Validators.required] },
    { name: 'apellido', label: 'Apellido', icon: 'person', layout: { row: 2, col: 6 }, type: 'text', value: '', validations: [Validators.required] },
    { name: 'dni', label: 'DNI', icon: 'badge', layout: { row: 3, col: 6 }, type: 'text', value: '', validations: [Validators.required, Validators.pattern('^[0-9]*$')] },
    { name: 'otroPuntoReferencia', label: 'Otro Punto de Referencia', icon: 'location_on', layout: { row: 3, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'barrioAvenida', label: 'Barrio / Avenida', icon: 'location_city', layout: { row: 4, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'grupoCalle', label: 'Grupo / Calle', icon: 'streetview', layout: { row: 4, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'numeroCasa', label: 'N° de Casa', icon: 'home', layout: { row: 5, col: 6 }, type: 'number', value: '', validations: [] },
    { name: 'telefonoSocio', label: 'Teléfono del Socio', icon: 'phone', layout: { row: 5, col: 6 }, type: 'text', value: '', validations: [] },
    { name: 'emailSocio', label: 'Correo del Socio', icon: 'email', layout: { row: 6, col: 12 }, type: 'text', value: '', validations: [Validators.email] },
    { name: 'municipio', label: 'Municipio', icon: 'location_city', layout: { row: 7, col: 6 }, type: 'text', value: '', validations: [Validators.required] },
    { name: 'porcentajeParticipacion', label: 'Porcentaje de Participación', icon: 'percent', layout: { row: 7, col: 6 }, type: 'text', value: '', validations: [Validators.required, Validators.min(0), Validators.max(100)] },
    { name: 'fechaIngreso', label: 'Fecha de Ingreso', icon: 'calendar_today', layout: { row: 8, col: 3 }, type: 'date', value: '', validations: [Validators.required] },
    { name: 'fechaSalida', label: 'Fecha de Salida', icon: 'calendar_today', layout: { row: 8, col: 5 }, type: 'date', value: '', validations: [] }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    if (!this.parentForm.get('sociedadSocios')) {
      this.parentForm.addControl('sociedadSocios', this.fb.array([]));
    }
  }

  get sociedadSocios(): FormArray {
    return this.parentForm.get('sociedadSocios') as FormArray;
  }

  addSociedadSocio(): void {
    const sociedadSocioGroup = this.fb.group({
      nombreSociedad: ['', Validators.required],
      rtn: [''],
      telefonoSociedad: [''],
      correoSociedad: ['', Validators.email],
      nombreSocio: ['', Validators.required],
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      otroPuntoReferencia: [''],
      barrioAvenida: [''],
      grupoCalle: [''],
      numeroCasa: [''],
      telefonoSocio: [''],
      emailSocio: ['', Validators.email],
      porcentajeParticipacion: ['', [Validators.required, Validators.min(0), Validators.max(100)]],
      fechaIngreso: ['', Validators.required],
      fechaSalida: [''],
      municipio: ['', Validators.required]
    });

    this.sociedadSocios.push(sociedadSocioGroup);
  }

  removeSociedadSocio(index: number): void {
    this.sociedadSocios.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
