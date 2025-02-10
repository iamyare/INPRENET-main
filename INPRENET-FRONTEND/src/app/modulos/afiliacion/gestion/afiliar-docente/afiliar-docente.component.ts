import { Component, ViewChild, TemplateRef, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ValidationErrors } from '@angular/forms';
import { MatStepper } from '@angular/material/stepper';
import { AfiliacionService } from '../../../../services/afiliacion.service';
import { ToastrService } from 'ngx-toastr';
import pdfMake from 'pdfmake/build/pdfmake';
import { HttpClient } from '@angular/common/http';
import { DatosEstaticosService } from '../../../../services/datos-estaticos.service';
import { DatosGeneralesTemporalComponent } from '../datos-generales-temporal/datos-generales-temporal.component';
import { PepsComponent } from '../peps/peps.component';
import { BancosComponent } from '../bancos/bancos.component';
import { RefPersComponent } from '../ref-pers/ref-pers.component';
import { ColMagisterialesComponent } from '../col-magisteriales/col-magisteriales.component';
import { DatPuestoTrabComponent } from '../dat-puesto-trab/dat-puesto-trab.component';
import { BenefComponent } from '../benef/benef.component';
import { OtrasFuentesIngresoComponent } from '../otras-fuentes-ingreso/otras-fuentes-ingreso.component';
import { FormStateService } from '../../../../services/form-state.service';
import { CamaraComponent} from '../../../../components/camara/camara.component';
import { StepperSelectionEvent } from '@angular/cdk/stepper';
import { AfiliadoService } from '../../../../services/afiliado.service';
import { PersonaService } from '../../../../services/persona.service';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-afiliar-docente',
  templateUrl: './afiliar-docente.component.html',
  styleUrls: ['./afiliar-docente.component.scss']
})
export class AfiliarDocenteComponent implements OnInit {
  backgroundImageBase64: string = '';
  useCamera: boolean = true;

  @ViewChild('datosGeneralesTemplate', { static: true }) datosGeneralesTemplate!: TemplateRef<any>;
  @ViewChild('referenciasPersonalesTemplate', { static: true }) referenciasPersonalesTemplate!: TemplateRef<any>;
  @ViewChild('colegiosMagisterialesTemplate', { static: true }) colegiosMagisterialesTemplate!: TemplateRef<any>;
  @ViewChild('bancosTemplate', { static: true }) bancosTemplate!: TemplateRef<any>;
  @ViewChild('centrosTrabajoTemplate', { static: true }) centrosTrabajoTemplate!: TemplateRef<any>;
  @ViewChild('beneficiariosTemplate', { static: true }) beneficiariosTemplate!: TemplateRef<any>;
  @ViewChild('datosGeneralesComponent', { static: false }) datosGeneralesComponent!: DatosGeneralesTemporalComponent;
  @ViewChild('pepsComponent', { static: false }) pepsComponent!: PepsComponent;
  @ViewChild('bancosComponent', { static: false }) bancosComponent!: BancosComponent;
  @ViewChild('refPersComponent', { static: false }) refPersComponent!: RefPersComponent;
  @ViewChild('colMagisterialesComponent', { static: false }) colMagisterialesComponent!: ColMagisterialesComponent;
  @ViewChild('centrosTrabajoComponent', { static: false }) centrosTrabajoComponent!: DatPuestoTrabComponent;
  @ViewChild('beneficiariosComponent', { static: false }) beneficiariosComponent!: BenefComponent;
  @ViewChild('datPuestoTrabComponent', { static: false }) datPuestoTrabComponent!: DatPuestoTrabComponent;
  @ViewChild('otrasFuentesIngresoComponent', { static: false }) otrasFuentesIngresoComponent!: OtrasFuentesIngresoComponent;
  @ViewChild('benefComponent', { static: false }) benefComponent!: BenefComponent;
  @ViewChild(MatStepper) stepper!: MatStepper;
  @ViewChild(CamaraComponent) camaraComponent!: CamaraComponent;

  steps: any[] = [];
  formGroup!: FormGroup;
  fotoPerfil: string = '';
  formErrors: any = null;
  usuarioToken: {
    correo: string;
    numero_empleado: string;
    departamento: string;
    municipio: string;
    nombrePuesto: string;
    nombreEmpleado: string;
  } | null = null;

  constructor(private fb: FormBuilder, private afiliacionService: AfiliacionService, private datosEstaticosService: DatosEstaticosService, 
    private toastr: ToastrService,  private formStateService: FormStateService, private http: HttpClient, private afiliadoService: AfiliadoService,
    private personaService: PersonaService, private authService: AuthService) {
    this.convertirImagenABase64('../assets/images/membratadoFinal.jpg').then(base64 => {
      this.backgroundImageBase64 = base64;
    }).catch(error => {
      console.error('Error al enviar los datos:', error);
      const errorMessage = error.error?.mensaje || 'Hubo un error al enviar los datos';
      this.toastr.error(errorMessage, 'Error');
    }
    );
  }

  ngOnInit(): void {
    this.formGroup = this.fb.group({});
    this.obtenerDatosDesdeToken();

    this.steps = [
      {
        label: 'Datos Generales',
        formGroup: this.fb.group({
          peps: this.fb.array([]),
          familiares: this.fb.array([]),
          colMags: this.fb.array([]),
        }),
        template: this.datosGeneralesTemplate
      },
      {
        label: 'Referencias Personales',
        formGroup: this.fb.group({}),
        template: this.referenciasPersonalesTemplate
      },
      {
        label: 'Cuentas Bancarias',
        formGroup: this.fb.group({}),
        template: this.bancosTemplate
      },
      {
        label: 'Centros de Trabajo y Otras Fuentes de Ingreso',
        formGroup: this.fb.group({}),
        template: this.centrosTrabajoTemplate
      },
      {
        label: 'Beneficiarios',
        formGroup: this.fb.group({}),
        template: this.beneficiariosTemplate
      }
    ];

    this.formGroup.addControl('datosGenerales', this.steps[0].formGroup);
    this.formGroup.addControl('referenciasPersonales', this.steps[1].formGroup);
    this.formGroup.addControl('bancos', this.steps[2].formGroup);
    this.formGroup.addControl('centrosTrabajo', this.steps[3].formGroup);
    this.formGroup.addControl('beneficiarios', this.steps[4].formGroup);
  }

  markAllAsTouched(control: FormGroup | FormArray): void {
    if (control instanceof FormGroup || control instanceof FormArray) {
      Object.values(control.controls).forEach(ctrl => {
        ctrl.markAsTouched();
        if (ctrl instanceof FormGroup || ctrl instanceof FormArray) {
          this.markAllAsTouched(ctrl);
        }
      });
    }
  }
  
  isStepInvalid(formGroup: FormGroup): boolean {
    return formGroup.invalid && (formGroup.touched || formGroup.dirty);
  }
//-----------------------------------------------
onSubmit(): void {
  const datosGenerales = this.formGroup.get('datosGenerales')?.value;

  // Validar que la foto de perfil esté presente
  if (!datosGenerales?.fotoPerfil) {
    this.toastr.warning('Por favor, capture una fotografía antes de enviar.', 'Advertencia');
    return; // Detener el envío si falta la foto
  }

  if (this.formGroup.valid) {
    // Recoger los datos de otros pasos
    const referenciasPersonales = this.formGroup.get('referenciasPersonales')?.value;
    const bancos = this.formGroup.get('bancos')?.value;
    const centrosTrabajo = this.formGroup.get('centrosTrabajo')?.value;
    const colegiosMagisteriales = datosGenerales.ColMags || [];
    const beneficiarios = this.formGroup.get('beneficiarios')?.value.beneficiario || [];
    const formattedData = {
      persona: {
        id_tipo_identificacion: datosGenerales.id_tipo_identificacion,
        id_pais_nacionalidad: datosGenerales.id_pais,
        n_identificacion: datosGenerales.n_identificacion,
        rtn: datosGenerales.rtn,
        grupo_etnico: datosGenerales.grupo_etnico,
        estado_civil: datosGenerales.estado_civil?.toUpperCase(),
        primer_nombre: datosGenerales.primer_nombre?.toUpperCase(),
        segundo_nombre: datosGenerales.segundo_nombre?.toUpperCase(),
        tercer_nombre: datosGenerales.tercer_nombre?.toUpperCase(),
        primer_apellido: datosGenerales.primer_apellido?.toUpperCase(),
        segundo_apellido: datosGenerales.segundo_apellido?.toUpperCase(),
        genero: datosGenerales.genero?.toUpperCase(),
        cantidad_hijos: datosGenerales.cantidad_hijos,
        cantidad_dependientes: datosGenerales.cantidad_dependientes,
        representacion: datosGenerales.representacion?.toUpperCase(),
        grado_academico: datosGenerales.grado_academico?.toUpperCase(),
        telefono_1: datosGenerales.telefono_1,
        telefono_2: datosGenerales.telefono_2,
        correo_1: datosGenerales.correo_1,
        correo_2: datosGenerales.correo_2,
        fecha_nacimiento: datosGenerales.fecha_nacimiento,
        direccion_residencia_estructurada: this.formatDireccion(datosGenerales).toUpperCase(),
        id_municipio_residencia: datosGenerales.id_municipio_residencia,
        id_municipio_nacimiento: datosGenerales.id_municipio_nacimiento,
        id_profesion: datosGenerales.id_profesion,
        discapacidades: this.formatDiscapacidades(datosGenerales.discapacidades) || [],
        fecha_afiliacion: new Date().toISOString()
      },
      familiares: this.formatFamiliares(datosGenerales, referenciasPersonales),
      peps: this.formatPeps(datosGenerales.peps || []),
      detallePersona: {
        eliminado: 'NO',
        tipo_persona: 'AFILIADO',
        nombre_estado: 'ACTIVO'
      },
      colegiosMagisteriales: colegiosMagisteriales.map((col: any) => ({
        id_colegio: col.id_colegio
      })),
      bancos: this.formatBancos(bancos.bancos || []),
      centrosTrabajo: this.formatCentrosTrabajo(centrosTrabajo.trabajo || []),
      otrasFuentesIngreso: this.formatOtrasFuentesIngreso(centrosTrabajo.otrasFuentesIngreso || []),
      referencias: this.formatReferencias(referenciasPersonales.refpers || []),
      beneficiarios: this.formatBeneficiarios(beneficiarios || []),
    };

    // Convertir foto de perfil base64 a File (si existe)
    const fotoPerfilBase64 = datosGenerales?.fotoPerfil || '';
    let fileFoto: any;
    if (fotoPerfilBase64) {
      const fotoBlob = this.dataURItoBlob(fotoPerfilBase64);
      fileFoto = new File([fotoBlob], 'perfil.jpg', { type: 'image/jpeg' });
    }

    // Archivo de identificación (ej. escaneo de cédula)
    const fileIdent = datosGenerales?.archivo_identificacion;

    console.log(formattedData);
    

    // Llamar al servicio para crear afiliación
    this.afiliacionService.crearAfiliacion(formattedData, fileFoto, fileIdent).subscribe(
      (response: any) => {
        console.log('Datos enviados con éxito:', response);
        this.toastr.success('Datos enviados con éxito', 'Éxito');

        const dniAfiliado = response[0].n_identificacion;
        if (!dniAfiliado) {
          console.warn('No se recibió un n_identificacion en la respuesta.');
          return;
        }

        this.personaService.getPersonaByDni(dniAfiliado).subscribe(
          (personaActualizada: any) => {
            if (!personaActualizada) {
              console.error('No se encontró la persona luego de crear la afiliación.');
              return;
            }

            personaActualizada.tipoFormulario = 'NUEVA AFILIACION';
            const documentDefinition = this.getDocumentDefinition(
              beneficiarios,
              response,
              this.backgroundImageBase64
            );
            pdfMake.createPdf(documentDefinition).download('beneficiarios.pdf');

            // Generar constancia QR
            this.afiliadoService.generarConstanciaQR(
              personaActualizada,
              this.usuarioToken,
              'afiliacion2'
            ).subscribe((blob: Blob) => {
              const downloadURL = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = downloadURL;
              link.download = this.generarNombreArchivo(personaActualizada, 'afiliacion2');
              link.click();
              window.URL.revokeObjectURL(downloadURL);
            });

            this.resetForm();
            this.formStateService.resetFotoPerfil();
          },
          (err) => {
            console.error('Error al consultar persona por DNI:', err);
          }
        );
      },
      (error: any) => {
        console.error('Error al enviar los datos:', error);
      
        // Extraer correctamente el mensaje del error
        const errorMessage = error.error?.message || error.error?.mensaje || 'Hubo un error al enviar los datos';
      
        // Mostrar el mensaje en Toastr
        this.toastr.error(errorMessage, 'Error');
      }
    );
  } else {
    this.formErrors = this.generateFormErrors(this.formGroup);
    this.markAllAsTouched(this.formGroup);
    this.toastr.warning('El formulario contiene información inválida', 'Advertencia');
  }
}

//-------------------------------------------------------------------
  getDocumentDefinition(userDetails: any[], beneficiarios: any, backgroundImageBase64: string): any {
    userDetails.forEach(item => {
      item.nombre = [item.primer_nombre, item.segundo_nombre, item.primer_apellido, item.segundo_apellido]
      .filter(name => name && name.trim() !== '') // Filtra los valores vacíos
      .join(' ') || 'N/A';item.fechaNacimiento = item.fecha_nacimiento || 'N/A';
      item.identidad = item.n_identificacion || 'N/A';
      item.parentesco = item.parentesco || 'N/A';
      item.porcentaje = item.porcentaje || 'N/A';
      item.direccion_residencia = item.direccion_residencia || 'N/A';
      item.telefono_1 = item.telefono_1 || 'N/A';
    });
    // Detalles del usuario
    beneficiarios.nombre = [
      beneficiarios[0].primer_nombre, 
      beneficiarios[0].segundo_nombre, 
      beneficiarios[0].primer_apellido, 
      beneficiarios[0].segundo_apellido
    ].filter(name => name && name.trim() !== '').join(' ') || 'N/A'
    beneficiarios.grado_academico = beneficiarios[0].grado_academico || 'N/A';
    beneficiarios.centroEducativo = beneficiarios[3].nombre_centro_trabajo || 'N/A';
    beneficiarios.municipioResidencia = beneficiarios[3].nombre_municipio || 'N/A';
    beneficiarios.departamentoResidencia = beneficiarios[3].nombre_departamento || 'N/A';
    beneficiarios.n_identificacion = beneficiarios[0].n_identificacion || 'N/A';

    interface TableCell {
      text?: string;
      style?: string;
      rowSpan?: number;
      colSpan?: number;
      fillColor?: string;
      alignment?: string;
    }

    const body: TableCell[][] = [
      [
        { text: 'N°', style: 'tableHeader', fillColor: '#CCCCCC', alignment: 'center' },
        { text: 'NOMBRE COMPLETO', style: 'tableHeader', alignment: 'center' },
        { text: 'FECHA DE NACIMIENTO', style: 'tableHeader', alignment: 'center' },
        { text: 'IDENTIDAD', style: 'tableHeader', alignment: 'center' },
        { text: 'PARENTESCO', style: 'tableHeader', alignment: 'center' },
        { text: '%', style: 'tableHeader', alignment: 'center' },
      ]
    ];

    userDetails.forEach((item, index) => {
      const fechaNacimiento = item.fechaNacimiento
        ? new Date(item.fechaNacimiento).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        : 'N/A';

      body.push(
        [
          { text: (index + 1).toString(), rowSpan: 2, style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.nombre, style: 'tableRowLarge', alignment: 'center' },
          { text: fechaNacimiento, style: 'tableRowLarge', alignment: 'center' },
          { text: item.identidad, style: 'tableRowLarge', alignment: 'center' },
          { text: item.parentesco, style: 'tableRowLarge', alignment: 'center' },
          { text: item.porcentaje, style: 'tableRowLarge', alignment: 'center' },
        ],
        [
          {},
          { text: 'DIRECCIÓN', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.direccion_residencia, style: 'tableRowLarge', colSpan: 2, alignment: 'center' },
          { text: '', style: 'tableRowLarge' },
          { text: 'TELEFONO/CEL', style: 'tableRowLarge', fillColor: '#CCCCCC', alignment: 'center' },
          { text: item.telefono_1, style: 'tableRowLarge', alignment: 'center' },
        ]
      );
    });

    return {
      background: function (currentPage: any, pageSize: any) {
        return {
          image: backgroundImageBase64,
          width: pageSize.width,
          height: pageSize.height,
          absolutePosition: { x: 0, y: 2 }
        };
      },
      content: [
        {
          text: [
            'Señores de la Comisión Interventora del INPREMA\nPresente.\n\nYo ',
            { text: beneficiarios.nombre, bold: true },
            ', mayor de edad, laborando como docente en el nivel ',
            { text: beneficiarios.grado_academico, bold: true },
            ', del Centro Educativo ',
            { text: beneficiarios.centroEducativo || 'NOMBRE NO DISPONIBLE', bold: true }, 
            ', ubicado en el Municipio ',
            { text: beneficiarios.municipioResidencia, bold: true },
            ' del Departamento ',
            { text: beneficiarios.departamentoResidencia, bold: true },
            ', con Identidad N°. ',
            { text: beneficiarios.n_identificacion, bold: true },
            ', comparezco ante el Instituto Nacional de Previsión del magisterio a registrar mis beneficiarios legales de la manera siguiente:\n\n'
          ],
          style: 'introText',
          margin: [0, 100, 0, 0] // Aumentar el margen superior a 100 para bajarlo
        },
        {
          table: {
            widths: [20, '*', '*', '*', '*', '*'],
            body: body
          }
        },
        {
          text: '', // Separación adicional
          margin: [0, 20, 0, 0]
        },
        {
          stack: [
            {
              text: [
                'También dispongo, que si alguno de mis beneficiarios (as) designados en este instrumento falleciere, el porcentaje de él o ella asignado, se distribuya en partes iguales entre los sobrevivientes registrados. Me reservo el derecho de actualizar, modificar o cancelar la presente DESIGNACIÓN, cuando lo estime conveniente.\n\n',
                { text: 'Nota: Con esta designación dejo sin valor ni efecto la presentada anteriormente.\n\n', bold: true }
              ],
              style: 'mainText'
            },
            {
              columns: [
                {
                  width: '*',
                  stack: [
                    {
                      text: 'Lugar y Fecha: _______________________________________________________________',
                      margin: [0, 20, 0, 15]  // Añadir margen adicional
                    },
                    {
                      text: '(f) _______________________________',
                      margin: [0, 15, 0, 0]  // Añadir margen adicional
                    }
                  ]
                },
                {
                  width: 'auto',
                  stack: [
                    {
                      canvas: [
                        {
                          type: 'rect',
                          x: 0,
                          y: 0,
                          w: 80,
                          h: 80,
                          lineWidth: 1,
                          lineColor: 'black'
                        }
                      ],
                      margin: [0, -25, 0, 0]  // Ajustar la posición vertical del cuadro de huella
                    },
                    {
                      text: 'Huella',
                      alignment: 'center',
                      margin: [0, -60, 0, 0]  // Ajustar la posición vertical de la palabra "Huella"
                    }
                  ]
                }
              ]
            },
            {
              style: 'usoExclusivo',
              table: {
                widths: ['*'],
                body: [
                  [{ text: 'PARA USO EXCLUSIVO DEL INPREMA', style: 'tableHeader', alignment: 'center', fillColor: '#CCCCCC' }],
                  [
                    {
                      columns: [
                        {
                          width: '50%',
                          stack: [
                            { text: 'Nombre del empleado: ___________________________', margin: [0, 10] },
                            { text: 'Código: _______', margin: [0, 10] }
                          ],
                          style: 'subHeader'
                        },
                        {
                          width: '50%',
                          stack: [
                            { text: '________________________________', alignment: 'center', margin: [0, 10, 0, 0] },
                            { text: 'Firma', alignment: 'center', margin: [-10, 0, 0, 0] }
                          ],
                          style: 'subHeader'
                        }
                      ]
                    }
                  ]
                ]
              },
              layout: {
                hLineWidth: function (i: any, node: any) {
                  return (i === 0 || i === node.table.body.length) ? 1 : 0.5;
                },
                vLineWidth: function (i: any, node: any) {
                  return (i === 0 || i === node.table.widths.length) ? 1 : 0.5;
                }
              },
              margin: [0, 20, 0, 0]
            }
          ]
        }
      ],
      styles: {
        introText: {
          fontSize: 12,
          margin: [0, 0, 0, 10]
        },
        mainText: {
          fontSize: 12,
          margin: [0, 0, 0, 10]
        },
        subHeader: {
          fontSize: 10,
          bold: false,
          margin: [0, 0, 0, 10]
        },
        tableHeader: {
          bold: true,
          fontSize: 10,
          color: 'black',
          fillColor: '#CCCCCC',
          alignment: 'center'
        },
        tableRow: {
          fontSize: 9,
          color: 'black',
          alignment: 'center'
        },
        tableRowLarge: {
          fontSize: 11,
          color: 'black',
          alignment: 'center'
        },
        grayBackground: {
          fillColor: '#CCCCCC'
        },
        usoExclusivo: {
          margin: [0, 20, 0, 0]
        }
      }
    };
  }

  private formatDireccion(datosGenerales: any): string {
    return [
      datosGenerales.barrio_colonia ? `BARRIO_COLONIA: ${datosGenerales.barrio_colonia}` : '',
      datosGenerales.avenida ? `AVENIDA: ${datosGenerales.avenida}` : '',
      datosGenerales.calle ? `CALLE: ${datosGenerales.calle}` : '',
      datosGenerales.sector ? `SECTOR: ${datosGenerales.sector}` : '',
      datosGenerales.bloque ? `BLOQUE: ${datosGenerales.bloque}` : '',
      datosGenerales.numero_casa ? `N° DE CASA: ${datosGenerales.numero_casa}` : '',
      datosGenerales.color_casa ? `COLOR CASA: ${datosGenerales.color_casa}` : '',
      datosGenerales.aldea ? `ALDEA: ${datosGenerales.aldea}` : '',
      datosGenerales.caserio ? `CASERIO: ${datosGenerales.caserio}` : ''
    ]
      .filter(Boolean)
      .join(', ');
  }

  private formatPeps(peps: any[]): any[] {
    return peps.map(pep => ({
      cargosPublicos: [
        {
          cargo: pep.pep_cargo_desempenado.toUpperCase() || '',
          fecha_inicio: pep.startDate || '',
          fecha_fin: pep.endDate || ''
        }
      ]
    }));
  }

  private formatBancos(bancos: any[]): any[] {
    return bancos.map(banco => ({
      id_banco: banco.id_banco,
      num_cuenta: banco.num_cuenta,
      estado: banco.estado
    }));
  }

  private formatCentrosTrabajo(trabajos: any[]): any[] {
    return trabajos.map(trabajo => ({
      id_centro_trabajo: trabajo.id_centro_trabajo?.value || trabajo.id_centro_trabajo,
      cargo: trabajo.cargo.toUpperCase(),
      numero_acuerdo: trabajo.numero_acuerdo,
      salario_base: trabajo.salario_base,
      fecha_ingreso: trabajo.fecha_ingreso,
      fecha_egreso: trabajo.fecha_egreso,
      fecha_pago: Number(trabajo.fecha_pago),
      estado: trabajo.estado,
      jornada: trabajo.jornada,
      tipo_jornada: trabajo.tipo_jornada,
      direccionCentro: trabajo.direccionCentro,
      id_municipio: trabajo.id_municipio,
      telefono_1: trabajo.telefono_1,
    }));
  }
  
  private formatOtrasFuentesIngreso(otrasFuentesIngreso: any[]): any[] {
    return otrasFuentesIngreso.map(fuente => ({
      actividad_economica: fuente.actividad_economica.toUpperCase(),
      monto_ingreso: fuente.monto_ingreso,
      observacion: fuente.observacion
    }));
  }

  private formatReferencias(refpers: any[]): any[] {
    return refpers.map(referencia => ({
      tipo_referencia: referencia.tipo_referencia.toUpperCase(),
      parentesco: referencia.parentesco.toUpperCase(),
      primer_nombre: referencia.primer_nombre.toUpperCase(),
      segundo_nombre: referencia.segundo_nombre.toUpperCase(),
      tercer_nombre: referencia.tercer_nombre.toUpperCase(),
      primer_apellido: referencia.primer_apellido.toUpperCase(),
      segundo_apellido: referencia.segundo_apellido.toUpperCase(),
      telefono_domicilio: referencia.telefono_domicilio,
      telefono_trabajo: referencia.telefono_trabajo,
      telefono_personal: referencia.telefono_personal,
      n_identificacion: referencia.n_identificacion,
      direccion: referencia.direccion.toUpperCase(),
    }));
  }

  private formatBeneficiarios(beneficiarios: any[]): any[] {
    return beneficiarios.map(beneficiario => {
      
      const discapacidades = this.mapDiscapacidades(beneficiario.discapacidades);
      return {
        persona: {
          archivo_identificacion: beneficiario.archivo_identificacion,
          n_identificacion: beneficiario.n_identificacion,
          primer_nombre: beneficiario.primer_nombre.toUpperCase(),
          segundo_nombre: beneficiario.segundo_nombre?.toUpperCase(),
          tercer_nombre: beneficiario.tercer_nombre?.toUpperCase(),
          primer_apellido: beneficiario.primer_apellido.toUpperCase(),
          segundo_apellido: beneficiario.segundo_apellido?.toUpperCase(),
          telefono_1: beneficiario.telefono_1,
          fecha_nacimiento: beneficiario.fecha_nacimiento,
          direccion_residencia: beneficiario.direccion_residencia.toUpperCase(),
          id_municipio_residencia: beneficiario.id_municipio_residencia,
          id_municipio_nacimiento: beneficiario.id_municipio_nacimiento
        },
        discapacidades: this.formatDiscapacidades(discapacidades),
        porcentaje: beneficiario.porcentaje || null,
        parentesco: beneficiario.parentesco?.toUpperCase() || null,
      };
    });
  }

  private formatFamiliares(datosGenerales: any, referenciasPersonales: any): any[] {
    const familiares = datosGenerales.familiares || [];
    return [
      ...familiares.map((familiar: any) => ({
        parentesco: familiar.parentesco,
        persona_referencia: {
          primer_nombre: familiar.primer_nombre?.toUpperCase() || '',
          segundo_nombre: familiar.segundo_nombre?.toUpperCase() || '',
          tercer_nombre: familiar.tercer_nombre?.toUpperCase() || '',
          primer_apellido: familiar.primer_apellido?.toUpperCase() || '',
          segundo_apellido: familiar.segundo_apellido?.toUpperCase() || '',
          telefono_domicilio: familiar.telefono_domicilio,
          telefono_trabajo: familiar.telefono_trabajo,
          telefono_personal: familiar.telefono_personal,
          n_identificacion: familiar.n_identificacion,
          fecha_nacimiento: familiar.fecha_nacimiento
        }
      })),
      ...(referenciasPersonales.conyuge && referenciasPersonales.conyuge.primer_nombre ? [{
        parentesco: "CÓNYUGE",
        persona_referencia: {
          primer_nombre: referenciasPersonales.conyuge.primer_nombre?.toUpperCase() || '',
          segundo_nombre: referenciasPersonales.conyuge.segundo_nombre?.toUpperCase() || '',
          tercer_nombre: referenciasPersonales.conyuge.tercer_nombre?.toUpperCase() || '',
          primer_apellido: referenciasPersonales.conyuge.primer_apellido?.toUpperCase() || '',
          segundo_apellido: referenciasPersonales.conyuge.segundo_apellido?.toUpperCase() || '',
          telefono_domicilio: referenciasPersonales.conyuge.telefono_domicilio,
          telefono_trabajo: referenciasPersonales.conyuge.telefono_trabajo,
          telefono_personal: referenciasPersonales.conyuge.telefono_celular,
          n_identificacion: referenciasPersonales.conyuge.n_identificacion,
          fecha_nacimiento: referenciasPersonales.conyuge.fecha_nacimiento,
          trabaja: referenciasPersonales.conyuge.trabaja,
        }
      }] : [])
    ];
  }


  dataURItoBlob(dataURI: string): Blob {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const buffer = new ArrayBuffer(byteString.length);
    const data = new DataView(buffer);

    for (let i = 0; i < byteString.length; i++) {
      data.setUint8(i, byteString.charCodeAt(i));
    }
    return new Blob([buffer], { type: mimeString });
  }

  handleImageCaptured(image: string): void {
    this.fotoPerfil = image;
  }

  onStepChange(event: StepperSelectionEvent): void {
    if (event.selectedIndex !== 0 && this.camaraComponent) {
      this.camaraComponent.resetCamera();
    }
  }
  
  resetForm(): void {
    this.formGroup.reset();
 
    if (this.datosGeneralesComponent) {
      this.datosGeneralesComponent.formGroup.patchValue({
        discapacidad: false,
      });
      
      if (this.datosGeneralesComponent && this.datosGeneralesComponent.camaraComponent) {
        this.datosGeneralesComponent.camaraComponent.resetCamera();
      }      
    }

    this.steps.forEach((step) => {
      step.formGroup.reset();
    });

    if (this.benefComponent) {
      this.benefComponent.reset();
    }
  
    if (this.pepsComponent) {
      this.pepsComponent.reset();
    }
  
    if (this.bancosComponent) {
      this.bancosComponent.reset();
    }
  
    if (this.refPersComponent) {
      this.refPersComponent.reset();
    }
  
    if (this.colMagisterialesComponent) {
      this.colMagisterialesComponent.reset();
    }
  
    if (this.centrosTrabajoComponent) {
      this.centrosTrabajoComponent.reset();
    }
  
    if (this.beneficiariosComponent) {
      this.beneficiariosComponent.reset();
    }
  
    if (this.datPuestoTrabComponent) {
      this.datPuestoTrabComponent.reset();
    }
  
    if (this.otrasFuentesIngresoComponent) {
      this.otrasFuentesIngresoComponent.reset();
    }

    this.stepper.reset();
  
    this.formErrors = null;

    this.markAllAsTouched(this.steps[0].formGroup);

    if (this.datosGeneralesComponent) {
      if (typeof this.datosGeneralesComponent.useCamera === 'function') {
        if (this.datosGeneralesComponent && typeof this.datosGeneralesComponent.useCamera === 'function') {
          this.datosGeneralesComponent.useCamera = true;
        }
      }
    }

    if (this.datosGeneralesComponent) {
      this.datosGeneralesComponent.formGroup.patchValue({
        discapacidad: false,
      });
    }  
  }
  
  formatDiscapacidades(discapacidades: any): any[] {
    return Object.keys(discapacidades)
      .filter(key => discapacidades[key])
      .map(key => ({ tipo_discapacidad: key }));
  }

  private mapDiscapacidades(discapacidadesArray: boolean[]): any {
    return this.datosEstaticosService.discapacidades.reduce((acc: any, discapacidad: any, index: number) => {
      acc[discapacidad.label] = discapacidadesArray[index];
      return acc;
    }, {});
  }

  convertirImagenABase64(url: string): Promise<string> {
    return this.http.get(url, { responseType: 'blob' }).toPromise().then(blob => {
      return new Promise<string>((resolve, reject) => {
        if (blob) {
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        } else {
          reject('No se pudo cargar la imagen. El blob es undefined.');
        }
      });
    });
  }

  generateFormErrors(control: FormGroup | FormArray): any {
    const errors: any = {};
    Object.keys(control.controls).forEach((key) => {
      const childControl = control.get(key);
      if (childControl instanceof FormGroup || childControl instanceof FormArray) {
        errors[key] = this.generateFormErrors(childControl);
      } else if (childControl?.errors) {
        errors[key] = this.getErrorMessages(childControl.errors);
      }
    });
    return errors;
  }
  
  private getErrorMessages(errors: ValidationErrors): string[] {
    const errorMessages: any = {
      required: 'Este campo es requerido.',
      minlength: (error: any) => `Debe tener al menos ${error.requiredLength} caracteres.`,
      maxlength: (error: any) => `No puede tener más de ${error.requiredLength} caracteres.`,
      pattern: 'El formato no es válido.',
      fechaIncorrecta: 'La fecha de ingreso no puede ser mayor a la fecha de egreso.',
    };
  
    return Object.keys(errors).map((key) => {
      const error = errors[key];
      return typeof errorMessages[key] === 'function'
        ? errorMessages[key](error)
        : errorMessages[key] || 'Error desconocido.';
    });
  }

  generarNombreArchivo(persona: any, tipo: string): string {
    const nombreCompleto = `${persona.primer_nombre}_${persona.primer_apellido}`;
    const fechaActual = new Date().toISOString().split('T')[0];
    return `${nombreCompleto}_${fechaActual}_constancia_${tipo}.pdf`;
  }

  private obtenerDatosDesdeToken(): void {
    const token = sessionStorage.getItem('token');
    if (token) {
      const dataToken = this.authService.decodeToken(token);
      this.usuarioToken = {
        correo: dataToken.correo,
        numero_empleado: dataToken.numero_empleado,
        departamento: dataToken.departamento,
        municipio: dataToken.municipio,
        nombrePuesto: dataToken.nombrePuesto,
        nombreEmpleado: dataToken.nombreEmpleado,
      };
    } else {
      console.warn('No se encontró un token en sessionStorage.');
    }
  }
}