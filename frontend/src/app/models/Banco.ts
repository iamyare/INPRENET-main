
import { FormControl, FormGroup, Validators } from '@angular/forms';

interface Banco {
    nombreBanco: string;
    numeroCuenta: string;
}

/* function generateDatBancFormGroup(): FormGroup {
    return new FormGroup({
      nombreBanco: new FormControl('', Validators.required),
      numeroCuenta: new FormControl('', Validators.required)
    });
} */

export  {Banco,/*  generateDatBancFormGroup */ };