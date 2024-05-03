import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { generateDatBancFormGroup } from '@docs-components/dat-banc/dat-banc.component';
import { generateAddressFormGroup } from '@docs-components/dat-generales-afiliado/dat-generales-afiliado.component';
import { generatePuestoTrabFormGroup } from '@docs-components/dat-puesto-trab/dat-puesto-trab.component';

import formatoFechaResol from 'src/app/models/fecha';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { generateFormArchivo } from '@docs-components/botonarchivos/botonarchivos.component';
import { generateHistSalFormGroup } from '@docs-components/historial-salario/historial-salario.component';
import { generateColegMagistFormGroup } from '@docs-components/col-magisteriales/col-magisteriales.component';


/* FIX:Corregir los datos de centros de trabajo que se le pasan al input del centro de trabajo */
/* FIX:Corregir que al cambiar de proceso el contenido del archivo este en el boton */

/* FIX: habilitar el boton de enviar si todos los formularios cumplen con las validaciones en cada uno de los inputs. */

@Component({
  selector: 'app-afil-banco',
  templateUrl: './afil-banco.component.html',
  styleUrl: './afil-banco.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AfilBancoComponent implements OnInit {
  DatosBancBen: any = [];

  // Manejan el control del progreso de los datos
  DatosGenerales: boolean = true; DatosBacAfil: boolean = false;
  Archivos: boolean = false; DatosPuestoTrab: boolean = false;
  DatosHS: boolean = false; referenc: boolean = false;
  datosBeneficiario: boolean = false; datosF: boolean = false;
  ColegiosMagisteriales: boolean = false;
  datosA = false

  // Formularios
  public formParent: FormGroup = new FormGroup({});
  form = this.fb.group({
    DatosGenerales: generateAddressFormGroup(),
    DatosBacAfil: generateDatBancFormGroup(),
    Archivos: generateFormArchivo(),
    Arch: "",
  });
  formPuestTrab: any = new FormGroup(
    {
      trabajo: new FormArray([], [Validators.required])
    });
    formHistPag: FormGroup = this.fb.group({
      banco: this.fb.array([])  // Esto asegura que siempre tienes una instancia de FormArray disponible
  });
  formReferencias: any = new FormGroup(
    {
      refpers: new FormArray([], [Validators.required])
    });
  formBeneficiarios: any = new FormGroup(
    {
      beneficiario: new FormArray([], [Validators.required])
    });
    formColegiosMagisteriales: any = new FormGroup(
    {
      ColMags: new FormArray([], [Validators.required])
    });

  labelBoton1 = "Adjunte archivo DNI"

  constructor(private fb: FormBuilder, private afilService: AfiliadoService) { }
  ngOnInit(): void { }

  // Manejan el control del progreso de los datos
  setEstadoDatGen(e: any) {
    this.DatosGenerales = e
    this.DatosGenerales = true
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = false

    this.ColegiosMagisteriales = false
  }

  setEstadoDatCentTrab(e: any) {
    this.DatosGenerales = false
    this.DatosPuestoTrab = true
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = false

    this.ColegiosMagisteriales = false
  }

  setDatosHS(datosHistSal: any) {
    this.DatosGenerales = false
    this.DatosPuestoTrab = false
    this.DatosHS = true
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = false

    this.ColegiosMagisteriales = false
  }

  setDatosReferenc(datosHistSal: any) {
    this.DatosGenerales = false
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = true
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = false

    this.ColegiosMagisteriales = false
  }

  setDatosBenef(datosHistSal: any) {
    this.DatosGenerales = false
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = true
    this.datosF = false
    this.datosA = false

    this.ColegiosMagisteriales = false
  }

  setDatosF(datosHistSal: any) {
    this.DatosGenerales = false
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = true
    this.datosA = false

    this.ColegiosMagisteriales = false
  }

  setDatosA(datosHistSal: any) {
    this.DatosGenerales = false
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = true

    this.ColegiosMagisteriales = false
  }

  setDatosAColegiosMag(datosHistSal: any) {
    this.DatosGenerales = false
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = false
    this.ColegiosMagisteriales = true
  }

  // Manejan la informacion de los formularios
  setDatosPuetTrab1(datosPuestTrab: any) {
    this.formPuestTrab.setControl('trabajo', this.fb.array(datosPuestTrab.trabajo || []));
}
setHistSal(datosHistSal: any) {
  if (datosHistSal && datosHistSal.banco) {
      this.formHistPag.setControl('banco', this.fb.array(
          datosHistSal.banco.map((item: any) => generateHistSalFormGroup(item))
      ));
  } else {
      this.formHistPag.setControl('banco', this.fb.array([]));
  }
}

setDatosColegiosMag(datosColegiosMag: any) {
  const formArray = this.formColegiosMagisteriales.get('ColMags') as FormArray;
  formArray.clear();
  datosColegiosMag.forEach((item: any) => {
    formArray.push(this.fb.group({
      idColegio: [item.idColegio, Validators.required]
    }));
  });
}



  setDatosRefPer(datosRefPer: any) {
    this.formReferencias = datosRefPer
  }
  setDatosBen(DatosBancBen: any) {
    this.formBeneficiarios = DatosBancBen
  }

  // Envia los datos del formulario al servicio para poder guardar la información
  enviar() {
    if (!this.formHistPag || !this.formHistPag.value || !this.formHistPag.value.banco) {
        console.error('No hay datos bancarios disponibles.');
        return;  // Salir del método si no hay datos
    }

    const data = {
        /* afiliado: {
            datosGen: this.form.value.DatosGenerales,
            Archivos: this.form.value.Archivos,
            Arch: this.form.value.Arch,
            PuestTrab: this.formPuestTrab.value.trabajo,
            banco: this.formHistPag.value.banco,  // Ahora debes tener datos aquí
            datosRefPers: this.formReferencias.value.refpers,
        }, */
        datosGenerales: this.form.value.DatosGenerales,
        centrosTrabajo: this.formPuestTrab.value.trabajo,
        referenciasPersonales: this.formReferencias.value.refpers,
        bancos: this.formHistPag.value.banco,
        beneficiarios: this.formBeneficiarios.value.beneficiario,
        colegiosMagisteriales: this.formColegiosMagisteriales.value.ColMags
  };

    console.log(data);
  }
  handleArchivoSeleccionado(archivo: any) {
    this.form.get('Arch')?.setValue(archivo);
    /*     console.log(this.form);
    */
    /* if (this.formParent && this.formParent.get('refpers')) {
      const ref_RefPers = this.formParent.get('refpers') as FormArray;
      if (ref_RefPers.length > 0) {
        const ultimoBeneficiario = ref_RefPers.at(i);
        if (ultimoBeneficiario.get('Archivos.Archivos')) {
          ultimoBeneficiario.get('Arch')?.setValue(archivo);
        }
      }
    } */
  }

  getLabel(): any {
    console.log(this.form.get("Archivos")?.value["Archivos"] != "");

    if (this.form.get("Archivos")?.value["Archivos"] != "") {
      this.labelBoton1 = this.form.get("Archivos")?.value["Archivos"]
    } else {
      this.labelBoton1 = "asds"
    }
    return this.labelBoton1
  }
}
