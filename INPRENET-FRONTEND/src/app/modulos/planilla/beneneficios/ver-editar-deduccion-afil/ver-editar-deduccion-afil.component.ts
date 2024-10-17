import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DeduccionesService } from 'src/app/services/deducciones.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';
import { Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-ver-editar-deduccion-afil',
  templateUrl: './ver-editar-deduccion-afil.component.html',
  styleUrls: ['./ver-editar-deduccion-afil.component.scss']
})
export class VerEditarDeduccionAfilComponent implements OnInit {
  //Para generar tabla
  columns: TableColumn[] = [];
  deducciones: any[] = [];
  filasT: any[] = [];
  ejecF: any;

  Afiliado: any = {}
  form: any;
  public myFormFields: FieldConfig[] = [];
  public monstrarDeducciones: boolean = false;

  constructor(
    private deduccionesService: DeduccionesService,
    private toastr: ToastrService,
    private datePipe: DatePipe,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.myFormFields = [
      { type: 'text', label: 'DNI del afiliado', name: 'dni', validations: [Validators.required, Validators.minLength(13), Validators.maxLength(14)], display: true },
      { type: 'number', label: 'Año', name: 'anio', validations: [Validators.required], display: true },
      { type: 'number', label: 'Mes', name: 'mes', validations: [Validators.required, Validators.min(1), Validators.max(12)], display: true },
    ];

    this.columns = [
      { header: 'Nombre Deducción', col: 'nombre_deduccion', isEditable: true },
      { header: 'Fecha aplicado', col: 'fecha_aplicado', isEditable: false },
      { header: 'Institución', col: 'nombre_institucion', isEditable: true },
      { header: 'Año', col: 'anio', isEditable: false },
      { header: 'Mes', col: 'mes', isEditable: false },
      { header: 'Código de planilla', col: 'codigo_planilla', isEditable: false },
      { header: 'Estado de aplicación', col: 'estado_aplicacion', isEditable: false },
      { header: 'Monto total', col: 'monto_total', isEditable: true }
    ]
  }

  async obtenerDatos(event: any): Promise<any> {
    this.form = event;
  }

  getFilas = async () => {
    try {
      const { dni, anio, mes } = this.form.value;
      const data = await this.deduccionesService.obtenerDeduccionesPorAnioMes(dni, anio, mes).toPromise();

      this.filasT = data.deducciones.map((item: any) => ({
        anio: item.anio,
        estado_aplicacion: item.estado_aplicacion,
        fecha_aplicado: this.datePipe.transform(item.fecha_aplicado, 'dd/MM/yyyy HH:mm'),
        mes: item.mes,
        monto_total: item.monto_aplicado,
        nombre_deduccion: item.deduccion_id ? item.deduccion_id.nombre_deduccion : 'No especificado',
        nombre_institucion: item.centro_trabajo ? item.centro_trabajo : 'No especificado',
        codigo_planilla: item.codigo_planilla
      }));

      this.Afiliado = data.persona;

      return this.filasT;
    } catch (error) {
      console.error("Error al obtener los detalles completos de deducción", error);

      if (error instanceof HttpErrorResponse) {
        this.toastr.error(`Error al cargar deducciones: ${error.message}`);
      } else {
        this.toastr.error('Error inesperado al cargar deducciones');
      }
      throw error;
    }
  };

  previsualizarInfoAfil() {
    this.monstrarDeducciones = true;
    this.getFilas().then(() => this.cargar());
  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filasT).then(() => {
      });
    }
  }

  async cargarOpcionesDeducciones(nombreInstitucion: string): Promise<any[]> {
    try {
      const deducciones = await this.deduccionesService.getDeduccionesByEmpresa(nombreInstitucion).toPromise();
      return deducciones.map((deduccion: any) => ({
        valor: deduccion.id_deduccion,
        etiqueta: deduccion.nombre_deduccion
      }));
    } catch (error) {
      this.toastr.error(`Error al cargar deducciones: ${error}`);
      return [];
    }
  }
}
