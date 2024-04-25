import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';
import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-puest-trab',
  templateUrl: './agregar-puest-trab.component.html',
  styleUrl: './agregar-puest-trab.component.scss'
})
export class AgregarPuestTrabComponent {
  form = this.fb.group({
  });
  formPuestTrab: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

    constructor(private fb: FormBuilder, private afilService: AfiliadoService) { }
    ngOnInit(): void { }

    setDatosPuetTrab1(datosPuestTrab: any) {
      this.formPuestTrab = datosPuestTrab
    }
}
