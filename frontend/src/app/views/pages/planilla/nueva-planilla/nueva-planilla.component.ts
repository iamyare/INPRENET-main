import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DynamicFormComponent } from '@docs-components/dynamic-form/dynamic-form.component';
import { ToastrService } from 'ngx-toastr';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { PlanillaService } from 'src/app/services/planilla.service';
import { generateFormArchivo } from 'src/components/botonarchivos/botonarchivos.component';

@Component({
  selector: 'app-nueva-planilla',
  templateUrl: './nueva-planilla.component.html',
  styleUrls: ['./nueva-planilla.component.scss']
})
export class NuevaPlanillaComponentP {
  @ViewChild(DynamicFormComponent) dynamicForm!: DynamicFormComponent;
  form: FormGroup;
  formplanilla: FormGroup;

  datosG: boolean = false;
  datosB: boolean = false;
  datosCT: boolean = false;
  datosHS: boolean = false
  datosRP: boolean = false

  constructor(private fb: FormBuilder, private planillaService: PlanillaService, private beneficiosService: BeneficiosService, private toastr: ToastrService,) {
    this.form = this.fb.group({
      isChecked: [false]
    });
    this.form = this.fb.group({
      isChecked: [false] // Inicializa el estado del mat-slide-toggle
    });
    this.formplanilla = this.fb.group({
      /* planilla: generatePlanillaFormGroup(), */
    });
  }

  ngOnInit() { }

  onChangeToggle() {
    // Acciones cuando el estado del mat-slide-toggle cambia
    // Por ejemplo: console.log('Estado del toggle:', this.form.get('isChecked')?.value);
    // Otras acciones según el valor de this.form.get('isChecked').value
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      console.log(file);

      this.planillaService.uploadExcel(file).subscribe(
        response => {
          console.log('Respuesta del servidor:', response);
          // Actualiza los datos compartidos a través del PlanillaService
          this.planillaService.updateUsers(response);
        },
        error => {
          console.error('Error al subir el archivo:', error);
        }
      );
    }
  }

  setEstadoDatGen(e: any) {
    this.datosB = false
    this.datosG = true
    this.datosCT = false
    this.datosRP = false
    this.datosHS = false

  }

  setEstadoTable(e: any) {
    this.datosB = false
    this.datosCT = true
    this.datosG = false
    this.datosHS = false
    this.datosRP = false
    this.cargarBeneficiosRecient();
  }

  setEstadoVerPlanP(e: any) {
    this.datosB = false
    this.datosG = false
    this.datosCT = false
    this.datosRP = false
    this.datosHS = true
  }

  setEstadoVerPlanDef(e: any) {
    this.datosB = false
    this.datosG = false
    this.datosCT = false
    this.datosHS = false
    this.datosRP = true
  }

  cargarBeneficiosRecient() {
    this.beneficiosService.cargarBeneficiosRecient().subscribe({
      next: (response: any) => {
        if (response) {
          let temp = response.Registros;
          this.toastr.success('Beneficios recientes Cargados exitosamente');
        }
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  limpiarFormulario(): void {
    if (this.dynamicForm) {
      this.dynamicForm.form.reset();
    }
  }
}
