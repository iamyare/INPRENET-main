import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
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

  constructor(private fb: FormBuilder, private afilService: AfiliadoService) { }
  ngOnInit(): void { }

  setDatosRefPer(datosRefPer: any) {
    this.formReferencias = datosRefPer
  }

}
