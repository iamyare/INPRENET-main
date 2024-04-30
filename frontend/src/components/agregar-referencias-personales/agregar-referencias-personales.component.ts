import { Component, Inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-referencias-personales',
  templateUrl: './agregar-referencias-personales.component.html',
  styleUrl: './agregar-referencias-personales.component.scss'
})
export class AgregarReferenciasPersonalesComponent {
  form = this.fb.group({
  });
  formReferencias: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

  constructor(private fb: FormBuilder, private afilService: AfiliadoService,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: number }
  ) { }
  ngOnInit(): void { }

  setDatosRefPer(datosRefPer: any) {
    this.formReferencias = datosRefPer
  }

  guardar(){
    console.log(this.formReferencias.value.refpers);
    console.log(this.data);

    this.afilService.createReferPersonales(String(this.data.idPersona), this.formReferencias.value.refpers).subscribe(
      (res: any) => {
        console.log(res);
        
        if (res.ok) {
          /* this.informacion = res.afiliados;
          this.dataSource.data = this.informacion.slice(0, this.pageSize);
          this.actualizarPaginador(); */
        }
      },
      (error) => {
        console.error('Error al obtener afiliados', error);
      }
      );
  }

}
