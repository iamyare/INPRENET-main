import { Component, Inject, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-agregar-dat-banc-comp',
  templateUrl: './agregar-dat-banc-comp.component.html',
  styleUrls: ['./agregar-dat-banc-comp.component.scss']
})
export class AgregarDatBancCompComponent implements OnInit {
  form: FormGroup;
  formHistPag: FormGroup;

  @Output() saved = new EventEmitter<any>(); // Emisor de eventos

  //@ViewChild(HistorialSalarioComponent) historialSalarioComponent!: HistorialSalarioComponent; // Obtén la referencia del componente hijo

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
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
    console.log('Datos recibidos en setHistSal:', datosHistSal);

    const bancoArray = this.formHistPag.get('banco') as FormArray;
    bancoArray.clear();

    if (datosHistSal && Array.isArray(datosHistSal.banco)) {
      datosHistSal.banco.forEach((banco: any) => {
        bancoArray.push(this.fb.group({
          id_banco: [banco.id_banco, Validators.required],
          num_cuenta: [banco.num_cuenta, Validators.required],
          estado: [banco.estado, Validators.required]
        }));
      });

      console.log('Estado del formulario después de setHistSal:', this.formHistPag.value);
    } else {
      console.warn('Datos de historial bancario no son válidos o están incompletos:', datosHistSal);
    }
  }

  guardar() {
    if (this.formHistPag.valid && (this.formHistPag.value.banco || []).length > 0) {
      this.afiliacionService.asignarBancosAPersona(+this.data.idPersona, this.formHistPag.value.banco).subscribe(
        (res: any) => {
          console.log('Respuesta del servicio:', res);
          if (res.length > 0) {
            this.toastr.success("Dato Bancario agregado con éxito");
            this.saved.emit(); // Emitir el evento cuando se guarda un banco
            this.resetForm();
            this.cerrar();
          }
        },
        (error) => {
          this.toastr.error(error);
          console.error('Error al guardar datos bancarios', error);
        }
      );
    } else {
      console.error('Errores o formulario incompleto:', this.formHistPag.value.banco);
      this.toastr.error("El formulario contiene errores o está incompleto.");
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
