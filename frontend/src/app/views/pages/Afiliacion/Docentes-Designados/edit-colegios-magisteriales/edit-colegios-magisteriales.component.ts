import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { AgregarColMagisComponent } from '@docs-components/agregar-col-magis/agregar-col-magis.component';
import { ConfirmDialogComponent } from '@docs-components/confirm-dialog/confirm-dialog.component';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { DatosEstaticosService } from 'src/app/services/datos-estaticos.service';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { convertirFechaInputs } from 'src/app/shared/functions/formatoFecha';
import { unirNombres } from 'src/app/shared/functions/formatoNombresP';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-edit-colegios-magisteriales',
  templateUrl: './edit-colegios-magisteriales.component.html',
  styleUrls: ['./edit-colegios-magisteriales.component.scss']
})
export class EditColegiosMagisterialesComponent implements OnInit, OnChanges, OnDestroy {
  convertirFechaInputs = convertirFechaInputs;
  public myFormFields: FieldConfig[] = [];
  form: any;
  @Input() Afiliado: any;
  unirNombres: any = unirNombres;
  datosTabl: any[] = [];
  colegiosMagisteriales: { label: string, value: any }[] = [];
  prevAfil: boolean = false;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;
  private subscriptions: Subscription = new Subscription();
  public loading: boolean = false;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private datosEstaticosService: DatosEstaticosService
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Afiliado'] && this.Afiliado) {
      this.initializeComponent();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  initializeComponent(): void {
    if (!this.Afiliado) {
      return;
    }

    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
    ];

    this.myColumns = [
      {
        header: 'Colegio Magisterial',
        col: 'colegio_magisterial',
        isEditable: true
      }
    ];
    this.getFilas();
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  resetDatos() {
    if (this.form) {
      this.form.reset();
    }
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    this.loading = true; // Mostrar el spinner antes de cargar los datos
    this.filas = [];
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllColMagPPersona(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.map((item: any) => {
          return {
            id_per_cole_mag: item.colegio.idColegio,
            colegio_magisterial: item.colegio.descripcion
          };
        });
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los colegios magisteriales');
        console.error('Error al obtener datos de los colegios magisteriales', error);
      }
    } else {
      this.resetDatos();
    }
    this.loading = false;
    this.cargar();
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  async editarFila(row: any) {
    this.colegiosMagisteriales = await this.datosEstaticosService.getColegiosMagisteriales();
    const campos = [
      {
        nombre: 'colegio_magisterial',
        tipo: 'list',
        requerido: true,
        etiqueta: 'Colegio Magisterial',
        editable: true,
        opciones: this.colegiosMagisteriales
      }
    ];
    const valoresIniciales = {
      colegio_magisterial: row.id_per_cole_mag
    };
    this.openDialog(campos, valoresIniciales);
  }

  eliminarFila(row: any) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmación de eliminación',
        message: '¿Estás seguro de querer eliminar este colegio magisterial?'
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.svcAfiliado.eliminarColegioMagisterialPersona(row.id_per_cole_mag).subscribe({
          next: (response: any) => {
            this.toastr.success("Colegio magisterial eliminado correctamente");
            this.getFilas();
          },
          error: (error: any) => {
            console.error('Error al eliminar el colegio magisterial al que pertenece la persona:', error);
            this.toastr.error('Ocurrió un error al eliminar el colegio magisterial al que pertenece la persona.');
          }
        });
      }
    });
  }

  AgregarColegioMagisterial() {

    const dialogRef = this.dialog.open(AgregarColMagisComponent, {
      width: '55%',
      height: '75%',
      data: {
        idPersona: this.Afiliado.id_persona
      }
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.getFilas();
      }
    });
  }

  openDialog(campos: any, valoresIniciales: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: valoresIniciales }
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      if (result) {
        this.svcAfiliado.updateColegiosMagist(result.id_per_cole_mag, result).subscribe(
          async (response) => {
            this.toastr.success('Colegio magisterial actualizado con éxito.');
            this.getFilas();
          },
          (error) => {
            this.toastr.error('Error al actualizar el colegio magisterial.');
            console.error('Error al actualizar el colegio:', error);
          }
        );
      }
    });
  }
}
