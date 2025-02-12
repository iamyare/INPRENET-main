import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { DatePipe } from '@angular/common';
import { EditarDialogComponent } from '../../../../../../src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { AgregarBenefCompComponent } from '../agregar-benef-comp/agregar-benef-comp.component';
import { PermisosService } from 'src/app/services/permisos.service';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { AuthService } from 'src/app/services/auth.service';
import { GestionarDiscapacidadDialogComponent } from 'src/app/components/dinamicos/gestionar-discapacidad-dialog/gestionar-discapacidad-dialog.component';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;
import { HttpClient } from '@angular/common/http';
@Component({
  selector: 'app-edit-beneficiarios',
  templateUrl: './edit-beneficiarios.component.html',
  styleUrls: ['./edit-beneficiarios.component.scss']
})
export class EditBeneficiariosComponent implements OnInit, OnChanges {
  convertirFechaInputs = convertirFechaInputs;
  @Input() persona: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  bancos: { label: string, value: string }[] = [];
  prevAfil: boolean = false;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  municipios: { label: string, value: any }[] = [];
  estados: { label: string, value: any }[] = [];
  public porcentajeDisponible: number = 0;
  public errorPorcentaje: string = '';
  public mostrarBotonAgregar: boolean = false;
  public mostrarBotonEditar: boolean = false;
  public mostrarBotonEliminar: boolean = false;
  public mostrarBotonAgregarDiscapacidad: boolean = false;
  public mostrarBotonGenerarPDF: boolean = false;
  backgroundImageBase64: string = '';

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private permisosService: PermisosService,
    private afiliacionServicio: AfiliacionService,
    private datosEstaticosService: DatosEstaticosService,
    private cdr: ChangeDetectorRef,
    private authService: AuthService,
    private http: HttpClient,

  ) {
    this.convertirImagenABase64('../../../../../assets/images/membratadoFinal.jpg').then(base64 => {
      this.backgroundImageBase64 = base64;
    }).catch(error => {
      console.error('Error al enviar los datos:', error);
      const errorMessage = error.error?.mensaje || 'Hubo un error al enviar los datos';
      this.toastr.error(errorMessage, 'Error');
    });
   }

  ngOnInit(): void {
    this.initializeComponent();
  
    // Verifica si el usuario tiene al menos uno de los permisos requeridos
    this.mostrarBotonAgregar = this.tienePermiso();
    this.mostrarBotonEditar = this.tienePermiso();
    this.mostrarBotonEliminar = this.tienePermiso();
    this.mostrarBotonAgregarDiscapacidad = this.tienePermiso();
  }
  
  // Función para verificar si tiene al menos uno de los permisos
  private tienePermiso(): boolean {
    return (
      this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['editar', 'editarDos'])
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['persona'] && this.persona) {
      this.initializeComponent();
    }
  }

  initializeComponent(): void {
    if (!this.persona) {
      this.resetDatos();
      return;
    }

    this.myColumns = [
      { header: 'Número De Identificación', col: 'n_identificacion', validationRules: [Validators.required, Validators.minLength(3)] },
      { header: 'Nombres', col: 'nombres' },
      { header: 'Apellidos', col: 'apellidos' },
      { header: 'Dirección', col: 'direccion_residencia' }, 
      { header: 'Teléfono', col: 'telefono_1' },
      { header: 'Parentesco', col: 'parentesco' },
      { header: 'Porcentaje', col: 'porcentaje' },
      { header: 'Genero', col: 'genero' },
      { header: 'Fecha de Nacimiento', col: 'fecha_nacimiento' },
      { header: 'Discapacidades', col: 'discapacidades' },
      
    ];
    this.getFilas().then(() => this.cargar());
  }

  resetDatos() {
    this.filas = [];
    this.persona = undefined;
  }

  async getFilas() {
    if (this.persona) {
      try {
        const data = await this.svcAfiliado.getAllBenDeAfil(this.persona.n_identificacion).toPromise();
        this.filas = data.map((item: any) => {
          const nombres = [item.primerNombre, item.segundoNombre, item.tercerNombre].filter(part => part).join(' ');
          const apellidos = [item.primerApellido, item.segundoApellido].filter(part => part).join(' ');
          const fechaNacimiento = this.datePipe.transform(item.fechaNacimiento, 'dd/MM/yyyy');
          const discapacidades = Array.isArray(item.discapacidades)
            ? item.discapacidades.map((disc: any) => disc.tipoDiscapacidad).join(', ')
            : '';

          return {
            idDetallePersona: item.idDetallePersona,
            id_causante: item.ID_CAUSANTE_PADRE,
            id_persona: item.idPersona,
            n_identificacion: item.nIdentificacion,
            nombres,
            apellidos,
            genero: item.genero,
            sexo: item.sexo,
            cantidad_dependientes: item.cantidadDependientes,
            telefono_1: item.telefono1,
            fecha_nacimiento: fechaNacimiento,
            direccion_residencia: item.direccionResidencia || '',
            idPaisNacionalidad: item.idPaisNacionalidad,
            id_municipio_residencia: item.idMunicipioResidencia,
            id_estado_persona: item.idEstadoPersona,
            porcentaje: item.porcentaje,
            parentesco: item.parentesco,
            tipo_persona: item.tipoPersona,
            discapacidades
          };
        });

        // Calcular porcentaje total y disponible
        const totalPorcentaje = this.filas.reduce((acc, fila) => acc + (fila.porcentaje || 0), 0);
        this.porcentajeDisponible = Math.max(100 - totalPorcentaje, 0);

        if (totalPorcentaje > 100) {
          this.errorPorcentaje = `La suma total de los porcentajes es ${totalPorcentaje}% y excede el límite permitido (100%).`;
        } else if (totalPorcentaje < 100) {
          this.errorPorcentaje = `Aún queda un ${this.porcentajeDisponible}% disponible para asignar.`;
        } else {
          this.errorPorcentaje = '';
        }

        this.mostrarBotonGenerarPDF = this.filas.length >= 1;
        this.cdr.detectChanges();
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los beneficiarios');
        console.error('Error al obtener datos de los beneficiarios', error);
      }
    } else {
      this.resetDatos();
    }
  }
  
  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => { });
    }
  }

  editarFila(row: any) {
    const porcentajeOcupado = this.filas.reduce((acc, fila) => acc + (fila.porcentaje || 0), 0);
    const porcentajeDisponible = 100 - (porcentajeOcupado - row.porcentaje);

    const validacionesDinamicas = {
      porcentaje: [
          Validators.required,
          Validators.min(1),
          Validators.max(porcentajeDisponible),
          (control: AbstractControl) => {
              const nuevoValor = Number(control.value);
              const totalPorcentaje = porcentajeOcupado - row.porcentaje + nuevoValor;
              return totalPorcentaje > 100 ? { excedeTotal: true } : null;
          }
      ]
  };

    const campos = [
        {
            nombre: 'porcentaje',
            tipo: 'number',
            etiqueta: 'Porcentaje',
            editable: true,
            icono: 'pie_chart',
            validadores: validacionesDinamicas.porcentaje
        },
        {
            nombre: 'direccion_residencia',
            tipo: 'text',
            etiqueta: 'Dirección de Residencia',
            editable: true,
            icono: 'home',
            validadores: [Validators.required, Validators.minLength(10), Validators.maxLength(200)]
        },
        {
            nombre: 'telefono_1',
            tipo: 'text',
            etiqueta: 'Teléfono',
            editable: true,
            icono: 'phone',
            validadores: [Validators.required, Validators.minLength(8), Validators.maxLength(12), Validators.pattern(/^[0-9]*$/)]
        },
        {
            nombre: 'parentesco',
            tipo: 'list',
            etiqueta: 'Parentesco',
            editable: true,
            icono: 'supervisor_account',
            opciones: this.datosEstaticosService.parentesco,
            validadores: [Validators.required]
        }
    ];

    this.openDialog(campos, row, validacionesDinamicas);
}



  openDialog(campos: any, row: any, validacionesDinamicas: any = {}): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos, valoresIniciales: row, validacionesDinamicas }
    });
  
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const updatedBeneficiario = {
          id_causante_padre: this.persona.id_persona,
          id_persona: row.id_persona,
          porcentaje: result.porcentaje,
          direccion_residencia: result.direccion_residencia, 
          parentesco: result.parentesco, 
          telefono_1: result.telefono_1
        };
  
        this.svcAfiliado.updateBeneficiario(row.idDetallePersona, updatedBeneficiario).subscribe(
          () => {
            this.toastr.success('Beneficiario actualizado exitosamente');
            this.getFilas().then(() => this.cargar());
          },
          (error) => {
            this.toastr.error('Error al actualizar el beneficiario');
            console.error('Error al actualizar el beneficiario', error);
          }
        );
      }
    });
  }
  
  eliminarFila(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar este beneficiario?'
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.inactivarPersona(row.id_persona, row.id_causante,);
      }
    });
  }

  AgregarBeneficiario() {
    const afiliadoDetalle = this.persona.detallePersona.find(
      (detalle: any) => detalle.tipoPersona && ['AFILIADO', 'JUBILADO', 'PENSIONADO'].includes(detalle.tipoPersona.tipo_persona)
    ); 
    if (!afiliadoDetalle) {
      this.toastr.error("No se encontró un registro de tipo 'AFILIADO'");
      return;
    }
    const porcentajeOcupado = this.filas.reduce((acc, fila) => acc + (fila.porcentaje || 0), 0);
  const porcentajeDisponible = 100 - porcentajeOcupado;

  const dialogRef = this.dialog.open(AgregarBenefCompComponent, {
    width: '55%',
    height: '75%',
    data: {
      idPersona: this.persona.id_persona,
      id_detalle_persona: afiliadoDetalle.ID_DETALLE_PERSONA,
      porcentajeDisponible 
    }
  });

  dialogRef.afterClosed().subscribe(() => {
    this.getFilas().then(() => this.cargar());
  });
  }

  inactivarPersona(idPersona: number, idCausante: number) {
    this.svcAfiliado.inactivarPersona(idPersona, idCausante).subscribe(
      () => {
        this.toastr.success('Beneficiario inactivado exitosamente');
        this.getFilas().then(() => this.cargar());
      },
      (error) => {
        this.toastr.error('Error al inactivar beneficiario');
        console.error('Error al inactivar beneficiario', error);
      }
    );
  }

  agregarDiscapacidad(row: any) {
    this.datosEstaticosService.getDiscapacidades().subscribe(discapacidades => {
      const discapacidadesArray = typeof row.discapacidades === 'string'
        ? row.discapacidades.split(', ').map((disc: string) => disc.trim())
        : row.discapacidades || [];

      const dialogRef = this.dialog.open(GestionarDiscapacidadDialogComponent, {
        width: '500px',
        data: {
          discapacidades: discapacidades,
          personaDiscapacidades: discapacidadesArray
        }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result) {
          if (result.agregar) {
            const discapacidadSeleccionada = discapacidades.find(disc => disc.value === result.tipo_discapacidad);
            if (discapacidadSeleccionada) {
              const discapacidadesPayload = [{ tipo_discapacidad: discapacidadSeleccionada.label }];
              this.afiliacionServicio.crearDiscapacidades(row.id_persona, discapacidadesPayload).subscribe(
                () => {
                  this.toastr.success('Discapacidad agregada exitosamente');
                  this.getFilas().then(() => this.cargar());
                },
                error => {
                  this.toastr.error('Error al agregar discapacidad');
                  console.error('Error al agregar discapacidad:', error);
                }
              );
            } else {
              console.error("No se encontró la discapacidad seleccionada");
            }
          }
          else if (result.eliminar) {
            this.afiliacionServicio.eliminarDiscapacidad(row.id_persona, result.discapacidadId).subscribe(
              () => {
                this.toastr.success('Discapacidad eliminada exitosamente');
                this.getFilas().then(() => this.cargar());
              },
              error => {
                this.toastr.error('Error al eliminar discapacidad');
                console.error('Error al eliminar discapacidad:', error);
              }
            );
          }
        }
      });
    });
  }
  
  generarPDF() {
    const beneficiarios = this.filas.map((b, index) => [
        { text: `${index + 1}`, alignment: 'center' }, // Índice
        { text: b.n_identificacion, alignment: 'center' }, // Identificación
        { text: `${b.nombres} ${b.apellidos}`, alignment: 'center' }, // Nombre completo
        { text: b.parentesco, alignment: 'center' }, // Parentesco
        { text: `${b.porcentaje}`, alignment: 'center' } // Porcentaje con el signo %
    ]);

    const token = sessionStorage.getItem('token');
    let dataToken;
    let user = 'Desconocido'; // Valor por defecto si no hay usuario

    if (token) {
        dataToken = this.authService.decodeToken(token);
        user = dataToken.correo.split("@")[0]; // Extraer el nombre de usuario del correo
    }

    this.getBase64ImageFromURL('/../../../../../assets/images/membratadoFinal.jpg').then((base64Image) => {
        const docDefinition: any = {
            pageSize: 'LETTER',
            pageMargins: [40, 100, 40, 80], // **Ajuste de margen inferior**
            background: [
                {
                    image: base64Image,
                    width: 600, // Ajusta el ancho del membrete
                    absolutePosition: { x: 0, y: 0 } // Ubicación exacta en la hoja
                }
            ],
            content: [
                {
                    text: 'DESIGNACIÓN DE BENEFICIARIOS',
                    style: 'header',
                    alignment: 'center',
                    margin: [0, 0, 0, 10] // Margen reducido para subir el título
                },
                {
                    text: `${this.persona.primer_nombre} ${this.persona.segundo_nombre || ''} ${this.persona.primer_apellido} ${this.persona.segundo_apellido || ''}`,
                    style: 'subheader',
                    alignment: 'center',
                    margin: [0, 0, 0, 5]
                },
                {
                    text: `Número de Identificación: ${this.persona.n_identificacion}`,
                    style: 'subheader',
                    alignment: 'center',
                    margin: [0, 0, 0, 20]
                },

                // Tabla de beneficiarios
                {
                    table: {
                        headerRows: 1,
                        widths: ['10%', '25%', '35%', '20%', '10%'], // Ancho de columnas
                        body: [
                            [
                                { text: 'N°', style: 'tableHeader', alignment: 'center' },
                                { text: 'Identificación', style: 'tableHeader', alignment: 'center' },
                                { text: 'Beneficiario', style: 'tableHeader', alignment: 'center' },
                                { text: 'Parentesco', style: 'tableHeader', alignment: 'center' },
                                { text: '%', style: 'tableHeader', alignment: 'center' }
                            ],
                            ...beneficiarios
                        ]
                    },
                    layout: {
                        hLineWidth: (i: any, node: any) => (i === 0 || i === node.table.body.length ? 1.5 : 0.5),
                        vLineWidth: () => 0.5,
                        hLineColor: () => '#AAAAAA',
                        vLineColor: () => '#AAAAAA',
                        paddingLeft: () => 5,
                        paddingRight: () => 5,
                        paddingTop: () => 3,
                        paddingBottom: () => 3
                    }
                }
            ],
            footer: function (currentPage: number, pageCount: number) {
                return {
                    margin: [20, -20, 20, 30], // **Moviendo el footer más arriba**
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                { text: 'Fecha y Hora: ' + new Date().toLocaleString(), alignment: 'left', border: [false, false, false, false], style: { fontSize: 8 } },
                                { text: `Generó: ${user}`, alignment: 'left', border: [false, false, false, false], style: { fontSize: 8 } },
                                { text: 'Página: ' + currentPage.toString() + ' de ' + pageCount, alignment: 'right', border: [false, false, false, false], style: { fontSize: 8 } }
                            ]
                        ]
                    }
                };
            },
            styles: {
                header: { fontSize: 18, bold: true, margin: [0, 10, 0, 5] },
                subheader: { fontSize: 14, italics: true, margin: [0, 0, 0, 10] },
                tableHeader: { bold: true, fontSize: 12, fillColor: '#DDDDDD' }
            }
        };

        pdfMake.createPdf(docDefinition).download('Beneficiarios.pdf');
    }).catch(error => {
        console.error("Error al cargar la imagen del membrete:", error);
        this.toastr.error("No se pudo cargar la imagen del membrete");
    });
}



  // Método para convertir imagen a Base64
  getBase64ImageFromURL(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      let img = new Image();
      img.crossOrigin = 'Anonymous'; // Para evitar problemas de CORS si la imagen está en otro dominio
      img.src = url;
      img.onload = () => {
        let canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        let ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        let dataURL = canvas.toDataURL('image/png'); // Convertir a Base64
        resolve(dataURL);
      };
      img.onerror = (error) => reject(error);
    });
  }

  convertirImagenABase64(url: string): Promise<string> {
    return this.http.get(url, { responseType: 'blob' }).toPromise().then((blob:any) => {
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

  generarPDF2() {
    this.obtenerPersonaConPerfilYBeneficiarios(this.persona.id_persona);
    setTimeout(() => {
      if (this.persona2 && this.perfil2 && this.beneficiarios2) {
        const documentDefinition = this.getDocumentDefinition(
          this.persona2, 
          this.perfil2, 
          this.beneficiarios2, 
          this.backgroundImageBase64
        );
        pdfMake.createPdf(documentDefinition).download();
      } else {
        this.toastr.error("No se pudo generar el PDF porque no se actualizaron los datos.");
      }
    }, 1000); // Espera 1 segundo para asegurar que los datos se actualicen
}

  
    getDocumentDefinition(persona: any, perfil: any, beneficiarios: any[], backgroundImageBase64: string): any {
      
      beneficiarios.forEach(item => {
        item.nombre = item.nombre_completo || 'N/A';
        item.fechaNacimiento = item.fecha_nacimiento || 'N/A';
        item.identidad = item.n_identificacion || 'N/A';
        item.parentesco = item.parentesco || 'N/A';
        item.porcentaje = item.porcentaje || 'N/A';
        item.direccion_residencia = item.direccion_residencia || 'N/A';
        item.telefono_1 = item.telefono_1 || 'N/A';
      });
  
      // Detalles del usuario (afiliado)
      const afiliado = {
        nombre: persona.nombre_completo || 'N/A',
        grado_academico: persona.grado_academico || 'N/A',
        centroEducativo: perfil.nombre_centro_trabajo || 'N/A',
        municipioResidencia: perfil.nombre_municipio || 'N/A',
        departamentoResidencia: perfil.nombre_departamento || 'N/A',
        n_identificacion: persona.n_identificacion || 'N/A'
      };
  
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
  
      beneficiarios.forEach((item, index) => {
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
              { text: afiliado.nombre, bold: true },
              ', mayor de edad, laborando como docente en el nivel ',
              { text: afiliado.grado_academico, bold: true },
              ', del Centro Educativo ',
              { text: afiliado.centroEducativo || 'NOMBRE NO DISPONIBLE', bold: true }, 
              ', ubicado en el Municipio ',
              { text: afiliado.municipioResidencia, bold: true },
              ' del Departamento ',
              { text: afiliado.departamentoResidencia, bold: true },
              ', con Identidad N°. ',
              { text: afiliado.n_identificacion, bold: true },
              ', comparezco ante el Instituto Nacional de Previsión del magisterio a registrar mis beneficiarios legales de la manera siguiente:\n\n'
            ],
            style: 'introText',
            margin: [0, 100, 0, 0]
          },
          {
            table: {
              widths: [20, '*', '*', '*', '*', '*'],
              body: body
            }
          },
          {
            text: '', 
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
                        margin: [0, 20, 0, 15]
                      },
                      {
                        text: '(f) _______________________________',
                        margin: [0, 15, 0, 0]
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
                        margin: [0, -25, 0, 0]
                      },
                      {
                        text: 'Huella',
                        alignment: 'center',
                        margin: [0, -60, 0, 0]
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
                margin: [0, 20, 0, 0]
              }
            ]
          }
        ],
        styles: {
          introText: { fontSize: 12, margin: [0, 0, 0, 10] },
          mainText: { fontSize: 12, margin: [0, 0, 0, 10] }
        }
      };
    }
    persona2:any
    perfil2:any
    beneficiarios2:any

    obtenerPersonaConPerfilYBeneficiarios(n_identificacion: string) {
      this.afiliacionServicio.obtenerPersonaConPerfilYBeneficiarios(n_identificacion).subscribe({
        next: (response) => {
          if (response.data) {
            this.persona2 = response.data.persona;
            this.perfil2 = response.data.perfil;
            this.beneficiarios2 = response.data.beneficiarios || [];
          } else {
            this.toastr.warning("No se encontraron datos asociados");
          }
        },
        error: (error) => {
          this.toastr.error("Error al obtener los datos de la persona");
          console.error("❌ Error en la carga de datos:", error);
        }
      });
    }
  

}
