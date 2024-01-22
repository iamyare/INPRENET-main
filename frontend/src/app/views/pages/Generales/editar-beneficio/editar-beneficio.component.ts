import { Component } from '@angular/core';
import { ValidatorFn, Validators } from '@angular/forms';

@Component({
  selector: 'app-editar-beneficio',
  templateUrl: './editar-beneficio.component.html',
  styleUrl: './editar-beneficio.component.scss'
})
export class EditarBeneficioComponent {
  myColumns: TableColumn[] = [
    { header: 'Nombre del Beneficio', col: 'col1', isEditable: true, validationRules: [Validators.required, Validators.minLength(3)] },
    { header: 'Descripcion del beneficio', col: 'col2', isEditable: true },
    { header: 'Prioridad', col: 'col3', isEditable: false },
    { header: 'Duracion', col: 'col4', isEditable: true },
   /*  {
      header: 'Acciones',
      col: 'acciones',
      isButton: true,
      buttonText: 'Hacer algo',
      buttonAction: (row) => this.hacerAlgo(row)
    } */
    // Más configuraciones de columnas según sea necesario
  ];

  filas: any[] = [
    { col1: 'Pension por vejez', col2: '', col3: '1', col4: 'vitalicio' },
    /* { col1: '2', col2: 'Oscar' },
    { col1: '3', col2: 'dsa' }, */
    // Más datos según sea necesario
  ];

  hacerAlgo(row: any) {
  console.log('Acción del botón en la fila:', row);
  // Aquí puedes agregar la lógica que necesites
}
}


interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
  isButton?: boolean;
  buttonAction?: (row: any) => void;
  buttonText?: string;
  isEditable?: boolean;// Nueva propiedad
  validationRules?: ValidatorFn[];
}


