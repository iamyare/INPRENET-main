import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { DatePipe } from '@angular/common';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { AgregarBenefCompComponent } from '../agregar-benef-comp/agregar-benef-comp.component';
import { PermisosService } from 'src/app/services/permisos.service';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { GestionarDiscapacidadDialogComponent } from 'src/app/components/dinamicos/gestionar-discapacidad-dialog/gestionar-discapacidad-dialog.component';

@Component({
  selector: 'app-edit-beneficiarios',
  templateUrl: './edit-beneficiarios.component.html',
  styleUrls: ['./edit-beneficiarios.component.scss']
})
export class EditBeneficiariosComponent implements OnInit, OnChanges {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
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
  public mostrarBotonAgregar: boolean = false;
  public mostrarBotonEditar: boolean = false;
  public mostrarBotonEliminar: boolean = false;
  public mostrarBotonAgregarDiscapacidad: boolean = false;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private permisosService: PermisosService,
    private afiliacionServicio: AfiliacionService,
    private datosEstaticosService: DatosEstaticosService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.mostrarBotonAgregar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/buscar-persona', 'editar');
    this.mostrarBotonEditar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/buscar-persona', 'editar');
    this.mostrarBotonEliminar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/buscar-persona', 'editar');
    this.mostrarBotonAgregarDiscapacidad = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/buscar-persona', 'editar')
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

    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      { header: 'Número De Identificación', col: 'n_identificacion', validationRules: [Validators.required, Validators.minLength(3)] },
      { header: 'Nombres', col: 'nombres' },
      { header: 'Apellidos', col: 'apellidos' },
      { header: 'Porcentaje', col: 'porcentaje' },
      { header: 'Fecha de Nacimiento', col: 'fecha_nacimiento' },
      { header: 'Discapacidades', col: 'discapacidades' }
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
          const respData = {
            idDetallePersona : item.idDetallePersona,
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
            direccion_residencia: item.direccionResidencia,
            idPaisNacionalidad: item.idPaisNacionalidad,
            id_municipio_residencia: item.idMunicipioResidencia,
            id_estado_persona: item.idEstadoPersona,
            porcentaje: item.porcentaje,
            tipo_persona: item.tipoPersona,
            discapacidades
          };
          return respData;
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

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        const updatedBeneficiario = {
          id_causante_padre: this.persona.id_persona,
          id_persona: row.id_persona,
          porcentaje: result.porcentaje
        };
        this.svcAfiliado.updateBeneficiario(row.idDetallePersona, updatedBeneficiario).subscribe(
          (response) => {
            this.toastr.success('Beneficiario actualizado exitosamente');
            this.getFilas().then(() => {
              const index = this.filas.findIndex((fila) => fila.id === row.id);
              if (index !== -1) {
                this.filas[index] = { ...this.filas[index], ...updatedBeneficiario };
                this.cargar();
              }
            });
          },
          (error) => {
            this.toastr.error('Error al actualizar el beneficiario');
            console.error('Error al actualizar el beneficiario', error);
          }
        );
      }
    });
  }

  editarFila(row: any) {
    const campos = [{
      nombre: 'porcentaje',
      tipo: 'number',
      etiqueta: 'Porcentaje',
      editable: true,
      icono: 'pie_chart',
      validadores: [
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ]
    }
    ];
    this.openDialog(campos, row);
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
      (detalle: any) => detalle.tipoPersona && detalle.tipoPersona.tipo_persona === 'AFILIADO' || 'JUBILADO' || 'PENSIONADO'
    );
    if (!afiliadoDetalle) {
      this.toastr.error("No se encontró un registro de tipo 'AFILIADO'");
      return;
    }
    const dialogRef = this.dialog.open(AgregarBenefCompComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.persona.id_persona,
        id_detalle_persona: afiliadoDetalle.ID_DETALLE_PERSONA
      }
    });
    dialogRef.afterClosed().subscribe((result: any) => {
      this.ngOnInit();
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

}
