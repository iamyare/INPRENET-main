import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-sociedad-socio',
  templateUrl: './sociedad-socio.component.html',
  styleUrls: ['./sociedad-socio.component.scss']
})
export class SociedadSocioComponent implements OnInit {
  sociedadSocioForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.sociedadSocioForm = this.fb.group({
      sociedadSocios: this.fb.array([])
    });
    this.addSociedadSocio();
  }

  get sociedadSocios(): FormArray {
    return this.sociedadSocioForm.get('sociedadSocios') as FormArray;
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

  onSubmit(): void {
    console.log(this.sociedadSocioForm.value);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }
}
