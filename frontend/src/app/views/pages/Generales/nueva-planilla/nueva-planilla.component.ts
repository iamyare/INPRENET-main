import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { PlanillaService } from 'src/app/services/planilla.service';
import { generateFormArchivo } from 'src/components/botonarchivos/botonarchivos.component';

@Component({
  selector: 'app-nueva-planilla',
  templateUrl: './nueva-planilla.component.html',
  styleUrls: ['./nueva-planilla.component.scss']
})
export class NuevaPlanillaComponentP {
  form: FormGroup;
  formplanilla: FormGroup;
  datosA: boolean = false;
  datosTable: boolean = false;
  datosPlan:boolean = false

  constructor(private fb: FormBuilder, private planillaService: PlanillaService) {
    /* this.form = this.fb.group({
      ArchivosDed: generateFormArchivo(),
      ArchivosPlan: generateFormArchivo(),
      Arch: "",
      isChecked: [false]
    }); */
    this.form = this.fb.group({
      ArchivosDed: generateFormArchivo(),
      ArchivosPlan: generateFormArchivo(),
      Arch: "",
      isChecked: [false] // Inicializa el estado del mat-slide-toggle
    });
    this.formplanilla = this.fb.group({
      /* planilla: generatePlanillaFormGroup(), */
    });
  }

  ngOnInit() {

  }

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
  setEstadoDatGen(e:any){
    this.datosA = true
    this.datosTable = false
    this.datosPlan = false
  }
  setEstadoTable(e:any){
    this.datosTable = true
    this.datosA = false
    this.datosPlan = false
  }
  subirNuevPlan(e:any){
    this.datosA = false
    this.datosTable = false
    this.datosPlan = true
  }
}
