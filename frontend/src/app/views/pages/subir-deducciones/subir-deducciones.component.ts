import { Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';
import { PlanillaService } from '../../../services/planilla.service';

@Component({
  selector: 'app-subir-deducciones',
  templateUrl: './subir-deducciones.component.html',
  styleUrls: ['./subir-deducciones.component.scss']
})
export class SubirDeduccionesComponent {
  form: FormGroup;
  datosA: boolean = false;
  datosTable: boolean = false;

  constructor(private fb: FormBuilder, private planillaService: PlanillaService) {
    this.form = this.fb.group({
      Archivos: generateFormArchivo(),
      Arch: "",
      isChecked: [false]
    });
  }

  ngOnInit() {
    this.form = this.fb.group({
      Archivos: generateFormArchivo(),
      Arch: "",
      isChecked: [false] // Inicializa el estado del mat-slide-toggle
    });
  }

  onChangeToggle() {
    // Acciones cuando el estado del mat-slide-toggle cambia
    // Por ejemplo: console.log('Estado del toggle:', this.form.get('isChecked')?.value);
    // Otras acciones según el valor de this.form.get('isChecked').value
  }

  setEstadoDatGen(e: any) {
    this.datosA = true;
    this.datosTable = false;
  }

  setEstadoTable(e: any) {
    this.datosTable = true;
    this.datosA = false;
  }

  onFileSelect(event: any): void {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
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
}
