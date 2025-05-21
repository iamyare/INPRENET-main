import { Component, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
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
import { EditBeneficiarioModalComponent } from '../edit-beneficiario-modal/edit-beneficiario-modal.component';
@Component({
  selector: 'app-edit-beneficiarios',
  templateUrl: './edit-beneficiarios.component.html',
  styleUrls: ['./edit-beneficiarios.component.scss']
})
export class EditBeneficiariosComponent implements OnInit, OnChanges {
  convertirFechaInputs = convertirFechaInputs;
  @Input() persona: any;
  @Output() onDatoAgregado = new EventEmitter<void>();
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
  validaciones:any;

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

  ) {}

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
      this.permisosService.userHasPermission('AFILIACIONES', 'afiliacion/buscar-persona', ['editar', 'editarDos', 'administrar'])
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
      { header: 'Nombre Completo', col: 'nombre_completo' },
      { header: 'Dirección', col: 'direccion_residencia' },
      { header: 'Lugar de Nacimiento', col: 'lugar_nacimiento' }, // Nueva columna
      { header: 'Lugar de Residencia', col: 'lugar_residencia' },
      { header: 'Teléfono', col: 'telefono_1' },
      { header: 'Parentesco', col: 'parentesco' },
      { header: 'Porcentaje', col: 'porcentaje' },
      { header: 'Fecha de Nacimiento', col: 'fecha_nacimiento' },
      { header: 'Genero', col: 'genero' },
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
            nombre_completo: `${nombres} ${apellidos}`.trim(),
            genero: item.genero,
            sexo: item.sexo,
            cantidad_dependientes: item.cantidadDependientes,
            telefono_1: item.telefono1,
            fecha_nacimiento: fechaNacimiento,
            direccion_residencia: item.direccionResidencia || '',
            idPaisNacionalidad: item.idPaisNacionalidad,
            id_municipio_nacimiento: item.idMunicipioNacimiento,
            id_municipio_residencia: item.idMunicipioResidencia,
            id_estado_persona: item.idEstadoPersona,
            porcentaje: parseFloat(item.porcentaje.toFixed(2)),
            parentesco: item.parentesco,
            tipo_persona: item.tipoPersona,
            id_departamento_residencia: item.idDepartamentoResidencia,
            id_departamento_nacimiento: item.idDepartamentoNacimiento,
            discapacidades,
            primer_nombre: item.primerNombre,
            segundo_nombre: item.segundoNombre,
            tercer_nombre: item.tercerNombre,
            primer_apellido: item.primerApellido,
            segundo_apellido: item.segundoApellido,
            lugar_nacimiento: `${item.nombreDepartamentoNacimiento} - ${item.nombreMunicipioNacimiento}`,
            lugar_residencia: `${item.nombreDepartamentoResidencia} - ${item.nombreMunicipioResidencia}`
          };
        });
        const totalPorcentaje = this.filas.reduce((acc, fila) => acc + (fila.porcentaje || 0), 0);
      this.porcentajeDisponible = parseFloat((100 - totalPorcentaje).toFixed(2));

      if (totalPorcentaje > 100) {
        this.errorPorcentaje = `La suma total de los porcentajes es ${totalPorcentaje}% y excede el límite permitido (100%).`;
      } else if (totalPorcentaje < 100) {
        this.errorPorcentaje = `Aún queda un ${this.porcentajeDisponible}% disponible para asignar.`;
      } else {
        this.errorPorcentaje = '';
      }
      this.cdr.detectChanges();

      this.afiliacionServicio.tieneBancoActivo(this.persona.id_persona).subscribe(validaciones => {
        this.validaciones = validaciones || {};
        this.cdr.detectChanges();
      });
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
    const totalOcupado = this.filas.reduce((acc, fila) => acc + (fila.porcentaje || 0), 0);
    const porcentajeDisponible = 100 - (totalOcupado - row.porcentaje);

    const dialogRef = this.dialog.open(EditBeneficiarioModalComponent, {
      width: '600px',
      data: { 
        beneficiario: row,
        porcentajeDisponible 
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        
        this.svcAfiliado.updateBeneficiario(row.id_persona, result).subscribe(
          () => {
            this.toastr.success('Beneficiario actualizado exitosamente');
            this.getFilas().then(() => this.cargar());
            this.onDatoAgregado.emit();
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
      this.svcAfiliado.inactivarPersona(row.id_persona, row.id_causante).subscribe(
        () => {
          this.toastr.success('Beneficiario inactivado exitosamente');
          this.getFilas().then(() => {
            this.cargar();
            this.onDatoAgregado.emit();
          });
        },
        (error) => {
          this.toastr.error('Error al inactivar beneficiario');
          console.error('Error al inactivar beneficiario', error);
        }
      );
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
      width: '70%',
      height: '75%',
      data: {
        idPersona: this.persona.id_persona,
        id_detalle_persona: afiliadoDetalle.ID_DETALLE_PERSONA,
        porcentajeDisponible 
      }
    });

    dialogRef.afterClosed().subscribe(() => {
      this.getFilas().then(() => {
        this.cargar();
        this.cdr.detectChanges(); // 🔹 Forzar la actualización de la vista
      });
      this.onDatoAgregado.emit();
    });
  }

  inactivarPersona(idPersona: number, idCausante: number) {
    this.svcAfiliado.inactivarPersona(idPersona, idCausante).subscribe(
      () => {
        this.toastr.success('Beneficiario inactivado exitosamente');
        this.getFilas().then(() => this.cargar());
        this.onDatoAgregado.emit();
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
        { text: `${b.nombre_completo}`, alignment: 'center' }, // Nombre completo
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

  descargarConstanciaBeneficiarios() {
    if (!this.persona || !this.persona.id_persona) {
        this.toastr.error('No se puede generar la constancia sin un afiliado seleccionado.');
        return;
    }

    const usuarioToken = this.authService.decodeToken(sessionStorage.getItem('token') || '');

    const empleadoDto = {
        nombreEmpleado: usuarioToken.nombreEmpleado || 'N/A',
        numero_empleado: usuarioToken.numero_empleado || 'N/A',
        departamento: usuarioToken.departamento || 'N/A',
        municipio: usuarioToken.municipio || 'N/A',
        nombrePuesto: usuarioToken.nombrePuesto || 'N/A',
        correo: usuarioToken.correo || 'N/A'
    };

    this.afiliacionServicio.descargarConstanciaBeneficiarios(this.persona.id_persona, empleadoDto).subscribe({
        next: (pdfBlob: Blob) => {
            const url = window.URL.createObjectURL(pdfBlob);
            window.open(url, '_blank');
        },
        error: (error) => {
            this.toastr.error('No se pudo descargar la constancia.');
            console.error('Error al descargar la constancia:', error);
        }
    });
}

intentarGenerarPDF() {
  if (this.puedeGenerarDocumentos()) {
    this.generarPDF(); // ✅ Si pasa la validación, genera el PDF
  } else {
    this.toastr.warning('No se puede generar el pdf porque debe actualizar toda su información.'); // ❌ Muestra mensaje de error
  }
}

// 🔹 Manejador para intentar generar el documento de beneficiarios
intentarDescargarConstancia() {
  if (this.puedeGenerarDocumentos()) {
    this.descargarConstanciaBeneficiarios(); // ✅ Si pasa la validación, genera el documento
  } else {
    this.toastr.warning('No se puede generar el pdf porque debe actualizar toda su información.'); // ❌ Muestra mensaje de error
  }
}

puedeGenerarDocumentos(): boolean {
  return this.validaciones?.tieneBancoActivo &&
         this.validaciones?.beneficiariosValidos &&
         this.validaciones?.tieneReferencias &&
         this.validaciones?.tieneCentroTrabajo &&
         this.validaciones?.datosCompletos &&
         this.validaciones?.ultimaActualizacionValida;
}
  
}
