import { Component, Input, OnInit, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/components/dinamicos/confirm-dialog/confirm-dialog.component';
import { AgregarColMagisComponent } from '../agregar-col-magis/agregar-col-magis.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { Validators } from '@angular/forms';
import { PermisosService } from 'src/app/services/permisos.service';

@Component({
  selector: 'app-edit-colegios-magisteriales',
  templateUrl: './edit-colegios-magisteriales.component.html',
  styleUrls: ['./edit-colegios-magisteriales.component.scss']
})
export class EditColegiosMagisterialesComponent implements OnInit, OnChanges, OnDestroy {
  @Input() Afiliado: any;
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  private ejecF: any;
  private subscriptions: Subscription = new Subscription();
  public mostrarBotonAgregar: boolean = false;
  public mostrarBotonEliminar: boolean = false;

  constructor(
    private svcAfiliado: AfiliadoService,
    private toastr: ToastrService,
    private dialog: MatDialog,
    private permisosService: PermisosService,
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
    this.mostrarBotonAgregar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/buscar-persona', 'editar');
    this.mostrarBotonEliminar = this.permisosService.userHasPermission('AFILIACIÓN', 'afiliacion/buscar-persona', 'editar');
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
      this.resetDatos();
      return;
    }

    this.myColumns = [
      {
        header: 'Colegio Magisterial',
        col: 'colegio_magisterial',
        isEditable: true,
        validationRules: [Validators.required]
      }
    ];
    this.getFilas().then(() => this.cargar());
  }

  resetDatos() {
    this.filas = [];
    this.Afiliado = undefined;
  }

  async getFilas() {
    if (this.Afiliado) {
      try {
        const data = await this.svcAfiliado.getAllColMagPPersona(this.Afiliado.n_identificacion).toPromise();
        this.filas = data.map((item: any) => ({
          id_per_cole_mag: item.id,
          colegio_magisterial: item.colegio.descripcion
        }));
        this.cdr.detectChanges();
      } catch (error) {
        this.toastr.error('Error al cargar los datos de los colegios magisteriales');
        console.error('Error al obtener datos de los colegios magisteriales', error);
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
          next: () => {
            this.toastr.success("Colegio magisterial eliminado correctamente");
            this.getFilas().then(() => this.cargar());
          },
          error: (error) => {
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
      // Llamar a getFilas para actualizar los datos de la tabla
      this.getFilas().then(() => this.cargar());
    });
  }

}
