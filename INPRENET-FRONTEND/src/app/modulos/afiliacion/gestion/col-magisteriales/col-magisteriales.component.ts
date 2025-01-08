import { Component, OnInit, Input } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';

@Component({
  selector: 'app-col-magisteriales',
  templateUrl: './col-magisteriales.component.html',
  styleUrls: ['./col-magisteriales.component.scss']
})
export class ColMagisterialesComponent implements OnInit {
  @Input() formGroup!: FormGroup;

  colegio_magisterial: any[] = [];

  constructor(
    private fb: FormBuilder,
    private datosEstaticosSVC: DatosEstaticosService
  ) {}

  ngOnInit(): void {
    if (!this.formGroup.get('ColMags')) {
      this.formGroup.addControl('ColMags', this.fb.array([]));
    }
    this.loadColegiosMagisteriales();
  }

  private loadColegiosMagisteriales() {
    this.datosEstaticosSVC.getColegiosMagisteriales().subscribe(colegios => {
      this.colegio_magisterial = colegios;
    });
  }

  get colMags(): FormArray {
    return this.formGroup.get('ColMags') as FormArray;
  }

  agregarColMag(): void {
    const colMagFormGroup = this.fb.group({
      id_colegio: ['', Validators.required]
    });

    this.colMags.push(colMagFormGroup);
    colMagFormGroup.markAllAsTouched();
    this.formGroup.markAsTouched();
  }

  eliminarColMag(index: number): void {
    if (this.colMags.length > 0) {
      this.colMags.removeAt(index);
    }
  }

  getAvailableColegios(index: number): any[] {
    const selectedColegios = this.colMags.controls.map(control => control.get('id_colegio')?.value);
    return this.colegio_magisterial.filter(colegio => !selectedColegios.includes(colegio.value) || selectedColegios[index] === colegio.value);
  }

  private markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(ctrl => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }

  reset(): void {
    this.colMags.clear();
    this.formGroup.reset();
  }

  getDescripcionById(value: any): string {
    const colegio = this.colegio_magisterial.find(item => item.value === value);
    return colegio ? colegio.abreviatura : '';
  }
  
}
