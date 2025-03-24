import { Component, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { EditarDialogComponent } from 'src/app/components/dinamicos/editar-dialog/editar-dialog.component';
import { BeneficiosService } from 'src/app/services/beneficios.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-editar-beneficio',
  templateUrl: './editar-beneficio.component.html',
  styleUrls: ['./editar-beneficio.component.scss']
})
export class EditarBeneficioComponent implements OnInit {
  public myColumns: TableColumn[] = [];
  public filas: any[] = [];
  ejecF: any;

  constructor(
    private svcBeneficioServ: BeneficiosService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.myColumns = [
      {
        header: 'Id Beneficio',
        col: 'id_beneficio',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Nombre del Beneficio',
        col: 'nombre_beneficio',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Descripción del beneficio',
        col: 'descripcion_beneficio',
        isEditable: true
      },
      {
        header: 'Periodicidad',
        col: 'periodicidad',
        isEditable: true
      },
      {
        header: 'Número máximo de rentas',
        col: 'numero_rentas_max',
        isEditable: true
      },
    ];

    this.getFilas().then(() => this.cargar());
  }

  editar = (row: any) => {
    const beneficioData = {
      id_beneficio: row.id_beneficio,
      nombre_beneficio: row.nombre_beneficio,
      descripcion_beneficio: row.descripcion_beneficio,
      numero_rentas_max: row.numero_rentas_max,
      periodicidad: row.periodicidad,
    };

    this.svcBeneficioServ.updateBeneficio(row.id, beneficioData).subscribe(
      response => {
        this.toastr.success('Beneficio editado con éxito');
      },
      error => {
        this.toastr.error('Error al actualizar el beneficio');
      }
    );
  };

  async getFilas() {
    try {
      const data = await this.svcBeneficioServ.getTipoBeneficio().toPromise();
      this.filas = data.map((item: any) => ({
        id_beneficio: item.id_beneficio,
        nombre_beneficio: item.nombre_beneficio,
        descripcion_beneficio: item.descripcion_beneficio || 'No disponible',
        numero_rentas_max: item.numero_rentas_max,
        periodicidad: item.periodicidad,
      }));
    } catch (error) {
      this.toastr.error('Error al cargar los beneficios');
      console.error('Error al obtener datos de beneficios', error);
    }
  }

  hacerAlgo(row: any) {

  }

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<boolean>) {
    this.ejecF = funcion;
  }

  cargar() {
    if (this.ejecF) {
      this.ejecF(this.filas).then(() => {
      });
    }
  }

  manejarAccionUno(row: any) {
    const campos = [
      { nombre: 'nombre_beneficio', tipo: 'text', requerido: true, etiqueta: 'Nombre del beneficio', editable: true },
      { nombre: 'descripcion_beneficio', tipo: 'text', requerido: true, etiqueta: 'descripcion del beneficio', editable: true },
      { nombre: 'numero_rentas_max', tipo: 'number', requerido: true, etiqueta: 'Número de rentas máximas', editable: true },
      { nombre: 'periodicidad', tipo: 'text', requerido: false, etiqueta: 'periodicidad', editable: false }
    ];

    this.openDialog(campos, row);
  }

  openDialog(campos: any, row: any): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: '500px',
      data: { campos: campos, valoresIniciales: row }
    });


    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {

      }
    });
  }
}
