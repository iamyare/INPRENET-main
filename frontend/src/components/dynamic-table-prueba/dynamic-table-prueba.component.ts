import { Component } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

interface Column {
  col: string;
  header: string;
  isEditable?: boolean;
  moneda?: boolean;
}

interface RowData {
  [key: string]: any;
  isEditing?: boolean;
}

@Component({
  selector: 'app-dynamic-table-prueba',
  templateUrl: './dynamic-table-prueba.component.html',
  styleUrl: './dynamic-table-prueba.component.scss'
})
export class DynamicTablePruebaComponent {
  dataSource: MatTableDataSource<RowData>;
  displayedColumns: string[] = ['select', 'identidad', 'nombre', 'acciones', 'botonUno', 'botonDos', 'botonTres', 'eliminar', 'editar'];
  columns: Column[] = [
    { col: 'identidad', header: 'Identidad' },
    { col: 'nombre', header: 'Nombre', isEditable: true },
    { col: 'monto', header: 'Monto', isEditable: true, moneda: true }
  ];

  verOpcEditar = true;
  verBotEditar = true;
  mostrarBotonUno = true;
  nombreEncabezadoUno = 'Acción Uno';
  etiquetaBotonUno = 'Acción 1';
  mostrarBotonDos = true;
  nombreEncabezadoDos = 'Acción Dos';
  etiquetaBotonDos = 'Acción 2';
  mostrarBotonTres = true;
  nombreEncabezadoTres = 'Acción Tres';
  etiquetaBotonTres = 'Acción 3';
  mostrarBotonEliminar = true;
  mostrarBotonEditar = true;

  searchResults: RowData[] = [
    { identidad: '12345', nombre: 'Juan', monto: 1000 },
    { identidad: '67890', nombre: 'Ana', monto: 2000 },
    { identidad: '54321', nombre: 'Luis', monto: 1500 }
  ];

  constructor(private fb: FormBuilder) {
    this.dataSource = new MatTableDataSource(this.searchResults);
  }

  ngOnInit() {
    this.searchResults.forEach(row => this.initRowControls(row));
  }

  initRowControls(row: RowData) {
    this.columns.forEach(col => {
      if (col.isEditable) {
        row[col.col + '_control'] = new FormControl(row[col.col], Validators.required);
      }
    });
  }

  onSelectionChange(row: RowData) {
    // Manejo de la selección
  }

  startEditing(row: RowData) {
    row.isEditing = true;
  }

  stopEditing(row: RowData) {
    row.isEditing = false;
  }

  saveChanges(row: RowData) {
    this.columns.forEach(col => {
      if (col.isEditable) {
        row[col.col] = row[col.col + '_control'].value;
      }
    });
    row.isEditing = false;
  }

  getCellValue(row: RowData, col: Column) {
    return row[col.col];
  }

  getControlErrors(row: RowData, col: Column) {
    const control = row[col.col + '_control'];
    return control.errors ? Object.keys(control.errors).map(key => control.errors[key]) : [];
  }

  ejecutarAccionUno(row: RowData) {
    // Lógica para acción uno
    console.log('Acción uno ejecutada', row);
  }

  ejecutarAccionDos(row: RowData) {
    // Lógica para acción dos
    console.log('Acción dos ejecutada', row);
  }

  ejecutarAccionTres(row: RowData) {
    // Lógica para acción tres
    console.log('Acción tres ejecutada', row);
  }

  eliminarFila(row: RowData) {
    this.dataSource.data = this.dataSource.data.filter((item: RowData) => item !== row);
  }

  editarFila(row: RowData) {
    this.startEditing(row);
  }

}
