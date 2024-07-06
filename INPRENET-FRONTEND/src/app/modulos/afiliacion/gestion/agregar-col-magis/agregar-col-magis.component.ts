import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output, OnInit } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-col-magis',
  templateUrl: './agregar-col-magis.component.html',
  styleUrls: ['./agregar-col-magis.component.scss'],
})
export class AgregarColMagisComponent implements OnInit {
  form = this.fb.group({});
  dataColMag: any;
  formColMag!: FormGroup;

  constructor(
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarColMagisComponent>,
    private fb: FormBuilder,
    private afilService: AfiliadoService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
  ) { }

  ngOnInit(): void {
    this.initFormColMag();
    console.log(this.data);

  }

  private initFormColMag(): void {
    this.formColMag = this.fb.group({
      ColMags: this.fb.array([]) // Inicializa el FormArray
    });
  }

  setHistSal(datosHistSal: any) {
    this.dataColMag = datosHistSal;
  }

  guardar() {
    this.afilService.createColegiosMagisteriales(this.data.idPersona, this.dataColMag).subscribe(
      (res: any) => {
        if (res.length > 0) {
          this.toastr.success("Colegio magisterial agregado con éxito");
          this.cerrar();
        }
      },
      (error) => {
        this.toastr.error(error);
        console.error('Error al crear colegios magisteriales pertenecientes al afiliado', error);
      }
    );
  }

  cerrar() {
    this.formColMag.reset();
    this.form.reset();
    this.dialogRef.close();
  }
}
