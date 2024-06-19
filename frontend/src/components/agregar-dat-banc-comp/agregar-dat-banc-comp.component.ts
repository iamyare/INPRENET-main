import { Component, Inject, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { HistorialSalarioComponent } from '../historial-salario/historial-salario.component'; // Ajusta la ruta si es necesario

@Component({
  selector: 'app-agregar-dat-banc-comp',
  templateUrl: './agregar-dat-banc-comp.component.html',
  styleUrls: ['./agregar-dat-banc-comp.component.scss']
})
export class AgregarDatBancCompComponent implements OnInit {
  form: FormGroup;
  formHistPag: FormGroup;

  @Output() saved = new EventEmitter<any>();

  @ViewChild(HistorialSalarioComponent) historialSalarioComponent!: HistorialSalarioComponent; // Obtén la referencia del componente hijo

  constructor(
    private fb: FormBuilder,
    private afilService: AfiliadoService,
    private dialogRef: MatDialogRef<AgregarDatBancCompComponent>,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
  ) {
    this.form = this.fb.group({});
    this.formHistPag = this.fb.group({
      banco: this.fb.array([])
    });
  }

  ngOnInit(): void { }

  setHistSal(datosHistSal: any) {
    const bancoArray = this.formHistPag.get('banco') as FormArray;
    bancoArray.clear();
    if (datosHistSal && Array.isArray(datosHistSal.value.banco)) {
      datosHistSal.value.banco.forEach((banco: any) => {
        bancoArray.push(this.fb.group({
          idBanco: [banco.idBanco, Validators.required],
          numCuenta: [banco.numCuenta, Validators.required]
        }));
      });
    } else {
      console.error('Datos de historial bancario no son válidos:', datosHistSal);
    }
  }

  guardar() {
    if (this.formHistPag.valid) {
      this.afilService.createDatosBancarios(this.data.idPersona, this.formHistPag.value.banco).subscribe(
        (res: any) => {
          if (res.length > 0) {
            this.toastr.success("Dato Bancario agregado con éxito");
            this.resetForm();
            this.saved.emit();
            this.cerrar();
          }
        },
        (error) => {
          this.toastr.error(error);
          console.error('Error al guardar datos bancarios', error);
        }
      );
    } else {
      this.toastr.error("El formulario contiene errores.");
    }
  }

  resetForm() {
    this.formHistPag.reset();
    (this.formHistPag.get('banco') as FormArray).clear();
    this.form.reset();
  }

  cerrar() {
    this.dialogRef.close();
  }
}
