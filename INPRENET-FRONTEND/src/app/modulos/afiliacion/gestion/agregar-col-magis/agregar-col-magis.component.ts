import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliacionService } from 'src/app/services/afiliacion.service';

@Component({
  selector: 'app-agregar-col-magis',
  templateUrl: './agregar-col-magis.component.html',
  styleUrls: ['./agregar-col-magis.component.scss'],
})
export class AgregarColMagisComponent implements OnInit {
  formColMag!: FormGroup;

  constructor(
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarColMagisComponent>,
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
  ) {}

  ngOnInit(): void {
    this.initFormColMag();
  }

  private initFormColMag(): void {
    this.formColMag = this.fb.group({
      ColMags: this.fb.array([])
    });
  }

  guardar() {
    const datosAGuardar = this.formColMag.get('ColMags')?.value;

    if (!datosAGuardar || datosAGuardar.length === 0) {
        this.toastr.error("No hay datos para guardar.");
        return;
    }

    this.afiliacionService.asignarColegiosAPersona(Number(this.data.idPersona), datosAGuardar).subscribe(
        (res: any) => {
            if (res.length > 0) {
                this.toastr.success("Colegio magisterial agregado con éxito");
                this.cerrar();
            }
        },
        (error) => {
            this.toastr.error("Error al asignar colegios magisteriales.");
            console.error('Error al crear colegios magisteriales pertenecientes al afiliado', error);
        }
    );
  }

  cerrar() {
    this.formColMag.reset();
    this.dialogRef.close();
  }
}
