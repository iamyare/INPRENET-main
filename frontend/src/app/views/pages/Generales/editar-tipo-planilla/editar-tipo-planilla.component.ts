import { Component, OnInit } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-editar-tipo-planilla',
  templateUrl: './editar-tipo-planilla.component.html',
  styleUrl: './editar-tipo-planilla.component.scss'
})
export class EditarTipoPlanillaComponent implements OnInit{
  myColumns: TableColumn[] = [];
  filas: any[] =[];

  ngOnInit(): void {
    // Definir las columnas
    this.myColumns = [
      {
        header: 'ID',
        col: 'id',
        isEditable: false
      },
      {
        header: 'Nombre',
        col: 'nombre',
        isEditable: true,
        validationRules: [Validators.required, Validators.minLength(3)]
      },
      {
        header: 'Email',
        col: 'email',
        isEditable: false
      }
    ];

    // Datos de ejemplo para las filas
    this.filas = [
      { id: 1, nombre: 'Juan Perez', email: 'juan@example.com' },
      { id: 2, nombre: 'Ana Lopez', email: 'ana@example.com' },
      { id: 3, nombre: 'Carlos García', email: 'carlos@example.com' }
    ];
  }
}


interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
  isButton?: boolean;
  buttonAction?: (row: any) => void;
  buttonText?: string;
  isEditable?: boolean; // Nueva propiedad
  validationRules?: ValidatorFn[];
}



/*  {
      header: 'Acciones',
      col: 'acciones',
      isButton: true,
      buttonText: 'Hacer algo',
      buttonAction: (row) => this.hacerAlgo(row)
    } */
