import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-agregar-benef-comp',
  templateUrl: './agregar-benef-comp.component.html',
  styleUrl: './agregar-benef-comp.component.scss'
})
export class AgregarBenefCompComponent {
  form = this.fb.group({
  });
  formBeneficiarios: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });
  constructor(private fb: FormBuilder, private afilService: AfiliadoService) { }
  ngOnInit(): void { }

  setDatosBen(DatosBancBen: any) {
    this.formBeneficiarios = DatosBancBen
  }
}
