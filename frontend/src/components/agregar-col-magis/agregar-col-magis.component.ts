import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, Output, inject } from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { DireccionService } from 'src/app/services/direccion.service';

@Component({
  selector: 'app-agregar-col-magis',
  templateUrl: './agregar-col-magis.component.html',
  styleUrl: './agregar-col-magis.component.scss',
})
export class AgregarColMagisComponent {
  form = this.fb.group({
  });

  formHistPag: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

    constructor(private fb: FormBuilder, private afilService: AfiliadoService,
      @Inject(MAT_DIALOG_DATA) public data: { idPersona: string }
    ) { }
    ngOnInit(): void { }

    setHistSal(datosHistSal: any) {
      this.formHistPag = datosHistSal
    }

    guardar(){
      console.log(this.formHistPag.value.refpers);
      console.log(this.data);
      
    }
}
