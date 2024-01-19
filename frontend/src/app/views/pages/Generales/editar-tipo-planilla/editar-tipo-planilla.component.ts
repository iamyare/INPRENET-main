import { Component } from '@angular/core';

@Component({
  selector: 'app-editar-tipo-planilla',
  templateUrl: './editar-tipo-planilla.component.html',
  styleUrl: './editar-tipo-planilla.component.scss'
})
export class EditarTipoPlanillaComponent {

  myColumns: TableColumn[] = [
    { header: 'Columna 1', col: 'col1' },
    { header: 'Columna 2', col: 'col2' },
    { header: 'Columna 3', col: 'col3' },
    { header: 'Columna 4', col: 'col4' },
    // Más configuraciones de columnas según sea necesario
  ];

  filas: any[] = [
    { col1: '1', col2: 'david', col3: 'MESSI' },
    { col1: '2', col2: 'Oscar' },
    { col1: '3', col2: 'dsa' },
    // Más datos según sea necesario
  ];
}

interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
}

