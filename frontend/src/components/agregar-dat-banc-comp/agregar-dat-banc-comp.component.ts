import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-dat-banc-comp',
  templateUrl: './agregar-dat-banc-comp.component.html',
  styleUrl: './agregar-dat-banc-comp.component.scss'
})
export class AgregarDatBancCompComponent {
  form = this.fb.group({
  });

  formHistPag: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });

    constructor(private fb: FormBuilder, private afilService: AfiliadoService) { }
    ngOnInit(): void { }

    setHistSal(datosHistSal: any) {
      this.formHistPag = datosHistSal
    }
}
