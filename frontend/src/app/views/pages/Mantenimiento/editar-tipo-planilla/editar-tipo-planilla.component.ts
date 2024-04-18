import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { EditarDialogComponent } from '@docs-components/editar-dialog/editar-dialog.component';
import { ToastrService } from 'ngx-toastr';
import { PlanillaService } from 'src/app/services/planilla.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-editar-tipo-planilla',
  templateUrl: './editar-tipo-planilla.component.html',
  styleUrl: './editar-tipo-planilla.component.scss'
})
export class EditarTipoPlanillaComponent implements OnInit {
  myColumns: TableColumn[] = [];
  filas: any[] = [];
  ejecF: any;

  constructor(
    private planillaService: PlanillaService,
    private toastr: ToastrService,
    private dialog: MatDialog
  ) {

  }

  ngOnInit(): void {
    // Definir las columnas
    this.myColumns = [
      {
        header: 'Nombre de planilla',
        col: 'nombre',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(5)]
      },
      {
        header: 'Descripción',
        col: 'descripcion',
        isEditable: true
      },
      {
        header: 'Clase de Planilla',
        col: 'clase_planilla',
        isEditable: true
      }
    ];

    this.getFilas().then(() => this.cargar());

  }

  getFilas = async () => {
    try {
      const data = await this.planillaService.findAllTipoPlanilla().toPromise();

      this.filas = data.map((item: any) => {
        return {
          id: item.id_tipo_planilla,
          nombre: item.nombre_planilla,
          clase_planilla: item.clase_planilla,
          descripcion: item.descripcion || 'No disponible'
        };
      });

      return this.filas;
    } catch (error) {
      console.error("Error al obtener datos de beneficios", error);
      throw error; // Puedes manejar el error aquí o dejarlo para que se maneje en el componente que llama a esta función
    }
  };

  editar = (row: any) => {
    const tipoPlanillaData = {
      nombre_planilla: row.nombre,
      descripcion: row.descripcion
    };

    this.planillaService.updateTipoPlanilla(row.id, tipoPlanillaData).subscribe(
      (response) => {
        this.toastr.success('TipoPlanilla editada con éxito');
      },
      (error) => {
        this.toastr.error('Error al actualizar TipoPlanilla');
      }
    );
  };

  ejecutarFuncionAsincronaDesdeOtroComponente(funcion: (data: any) => Promise<void>) {
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
      { nombre: 'nombre', tipo: 'text', requerido: true, etiqueta: 'Nombre Planilla', editable: true },
      { nombre: 'clase_planilla', tipo: 'text', requerido: true, etiqueta: 'Clase de Planilla', editable: true },
      { nombre: 'descripcion', tipo: 'text', requerido: true, etiqueta: 'descripcion', editable: true }
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
        console.log('Datos editados:', result);
      }
    });
  }

  manejarAccionDos(row: any) {
    // Lógica para manejar la acción del segundo botón
  }

}
