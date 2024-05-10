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
import { FormStateService } from 'src/app/services/form-state.service';

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
  // Manejan el control del progreso de los datos
  DatosGenerales: boolean = true; DatosBacAfil: boolean = false;
  Archivos: boolean = false; DatosPuestoTrab: boolean = false;
  DatosHS: boolean = false; referenc: boolean = false;
  datosBeneficiario: boolean = false; datosF: boolean = false;
  datosFamiliares: boolean = false; ColegiosMagisteriales: boolean = false;
  datosA = false

  // Formularios
  public formParent: FormGroup = new FormGroup({});
  form = this.fb.group({
    DatosGenerales: generateAddressFormGroup(),
    FotoPerfil: [''],
    DatosBacAfil: generateDatBancFormGroup(),
    Archivos: generateFormArchivo(),
    Arch: "",
  });
  formPuestTrab: any = new FormGroup({
    trabajo: new FormArray([], [Validators.required])
  });
  formHistPag: FormGroup = this.fb.group({
    banco: this.fb.array([])  // Esto asegura que siempre tienes una instancia de FormArray disponible
  });
  formReferencias: any = new FormGroup({
    refpers: new FormArray([], [Validators.required])
  });
  formBeneficiarios: any = new FormGroup({
    beneficiario: new FormArray([], [Validators.required])
  });
  formDatosFamiliares: any = new FormGroup({
    familiares: new FormArray([], [Validators.required])
  });
  formColegiosMagisteriales: any = new FormGroup({
    ColMags: new FormArray([], [Validators.required])
  });

  labelBoton1 = "Adjunte archivo DNI"
  DatosBancBen: any = [];

  constructor(private fb: FormBuilder, private formStateService: FormStateService, private afilService: AfiliadoService) {
  }

  ngOnInit(): void {
    // Recupera la imagen guardada en el servicio
    const fotoPerfil = this.formStateService.getFotoPerfil().value;
    if (fotoPerfil) {
      this.form.get('FotoPerfil')?.setValue(fotoPerfil);
    }
  }

  handleImageCaptured(image: string) {
    this.form.get('FotoPerfil')?.setValue(image);
  }

  // Manejan el control del progreso de los datos
  setEstadoDatGen(e: any) {
    this.DatosGenerales = true
    this.datosFamiliares = false
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = false
    this.ColegiosMagisteriales = false
  }
  setEstadoDatFam(e: any) {
    this.DatosGenerales = false
    this.datosFamiliares = true
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
    this.datosFamiliares = false
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
    this.datosFamiliares = false
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
    this.datosFamiliares = false
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
    this.datosFamiliares = false
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
    this.datosFamiliares = false
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
    this.datosFamiliares = false
    this.DatosPuestoTrab = false
    this.DatosHS = false
    this.referenc = false
    this.datosBeneficiario = false
    this.datosF = false
    this.datosA = true
    this.ColegiosMagisteriales = false
  }
  setDatosAColegiosMag(datosHistSal: any) {
    this.datosFamiliares = false
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
  setDatosFamiliares(datosFamiliares: any) {
    this.formDatosFamiliares = datosFamiliares
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

  // Envia los datos del formulario al servicio para poder guardar la información
  enviar() {
    // Recopila todos los datos necesarios para el DTO encapsulado
    const encapsulatedDto = {
      datosGenerales: this.form.get('DatosGenerales')?.value || {},
      bancos: this.formHistPag.value.banco || [],
      referenciasPersonales: this.formReferencias.value.refpers || [],
      beneficiarios: this.formBeneficiarios.value.beneficiario || [],
      centrosTrabajo: this.formPuestTrab.value.trabajo || [],
      colegiosMagisteriales: this.formColegiosMagisteriales.value.ColMags || [],
      familiares: this.formDatosFamiliares.value.familiar || []
    };

    // Crear el objeto FormData
    const formData = new FormData();
    formData.append('encapsulatedDto', JSON.stringify(encapsulatedDto));

    // Incluir la imagen de perfil si está disponible
    const fotoPerfilBase64 = this.form.get('FotoPerfil')?.value;
    if (fotoPerfilBase64) {
      const fotoBlob = this.dataURLToBlob(fotoPerfilBase64);
      formData.append('foto_perfil', fotoBlob, 'perfil.jpg');
    }

    // Crear un objeto intermedio para depurar el contenido de `FormData`
    const formDataObj: any = {};
    formData.forEach((value, key) => {
      formDataObj[key] = value instanceof Blob ? 'Archivo adjunto' : value;
    });

    // Registra los datos encapsulados en la consola
    console.log('Datos a enviar:', formDataObj.encapsulatedDto);

    // Llamar al servicio para enviar la solicitud al backend
    this.afilService.createPersonaWithDetailsAndWorkCenters(formData)
      .subscribe(
        response => {
          console.log('Datos enviados con éxito:', response);
        },
        error => {
          console.error('Error al enviar los datos:', error);
        }
      );
  }

  // Función auxiliar para convertir un data URL a Blob
  dataURLToBlob(dataURL: string): Blob {
    const byteString = atob(dataURL.split(',')[1]);
    const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new Uint8Array(byteString.length);

    for (let i = 0; i < byteString.length; i++) {
      buffer[i] = byteString.charCodeAt(i);
    }

    return new Blob([buffer], { type: mimeString });
  }


}
