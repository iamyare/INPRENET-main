import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';
import { SelectionserviceService } from 'src/app/services/selectionservice.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-dynamic-table-prueba',
  templateUrl: './dynamic-table-prueba.component.html',
  styleUrls: ['./dynamic-table-prueba.component.scss']
})
export class DynamicTablePruebaComponent implements OnInit, OnDestroy {
  @Input() verOpcEditar: boolean = false;
  @Input() verBotEditar: boolean = false;
  @Output() getElemSeleccionados = new EventEmitter<any>();

  @Input() getData?: any;
  @Input() data?: any;
  filas: any = [];

  @Output() ejecutarFuncionAsincronaEvent: EventEmitter<(param: any) => Promise<boolean>> = new EventEmitter<(param: any) => Promise<boolean>>();

  @Input() columns: TableColumn[] = [];
  @Input() itemsPerPages: any;
  @Input() editarFunc: any;

  @Input() nombreEncabezadoUno: string = '';
  @Input() mostrarBotonUno: boolean = false;
  @Input() etiquetaBotonUno: string = '';
  @Output() accionBotonUno: EventEmitter<any> = new EventEmitter<any>();

  @Input() nombreEncabezadoDos: string = '';
  @Input() mostrarBotonDos: boolean = false;
  @Input() etiquetaBotonDos: string = '';
  @Output() accionBotonDos: EventEmitter<any> = new EventEmitter<any>();

  @Input() nombreEncabezadoTres: string = '';
  @Input() mostrarBotonTres: boolean = false;
  @Input() etiquetaBotonTres: string = '';
  @Output() accionBotonTres: EventEmitter<any> = new EventEmitter<any>();

  @Input() mostrarBotonEliminar: boolean = false;
  @Input() mostrarBotonEditar: boolean = false;
  @Output() eliminar: EventEmitter<any> = new EventEmitter<any>();
  @Output() editar: EventEmitter<any> = new EventEmitter<any>();

  @Input() titulo = "";
  @Input() subtitulo = "";

  @Input() enableRowClick: boolean = false;
  @Input() highlightOnHover: boolean = true; // Nueva entrada para habilitar/deshabilitar el sombreado al pasar el ratón

  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  private destroy$: Subject<void> = new Subject<void>();

  formsearch = new FormControl('');
  searchResults: any = [];

  desde = 0;

  currentPage = 0;

  editingRow: any | null = null;
  editFormControls: { [rowKey: string]: { [colKey: string]: FormControl } } = {};
  editableRows: any[] = [];

  columnDefs: string[] = [];

  selectedItem: any; // Agregamos selectedItem
  itemsPerPage!: number;
  hasta!: number;

  constructor(private selectionService: SelectionserviceService) {

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async ejecutarFuncionAsincrona(data: any) {
    if (data) {
      this.filas = data;
      this.filas?.map((objeto: any) => ({ ...objeto, isSelected: false }));
      this.filtrarUsuarios().subscribe();
      return true
    } else {
      this.filas = await this.getData();
      this.filtrarUsuarios().subscribe();
      return false
    }
  }

  ngOnInit(): void {
    this.formsearch.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.filtrarUsuarios(query)),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        this.searchResults = results;
        this.currentPage = 0;
        this.paginator?.firstPage();
      });

    if (this.itemsPerPages) {
      this.itemsPerPage = parseInt(this.itemsPerPages);
    } else {
      this.itemsPerPage = 20;
    }

    this.hasta = this.itemsPerPage;

    this.ejecutarFuncionAsincronaEvent.emit(this.ejecutarFuncionAsincrona.bind(this));
    this.columnDefs = [
      ...(this.verOpcEditar ? ['opcionesEditar'] : []),
      ...this.columns.map(col => col.col),
      ...(this.verBotEditar ? ['acciones'] : []),
      ...(this.mostrarBotonUno ? ['botonUno'] : []),
      ...(this.mostrarBotonDos ? ['botonDos'] : []),
      ...(this.mostrarBotonTres ? ['botonTres'] : []),
      ...(this.mostrarBotonEliminar ? ['eliminar'] : []),
      ...(this.mostrarBotonEditar ? ['editar'] : [])
    ];
    this.calculateTotals();
  }

  filtrarUsuarios(query?: any): Observable<any[]> {
    let filteredResults: any = [];
    const temp: any = [...this.filas];

    const startIndex = this.currentPage * this.itemsPerPage;
    if (!query) {
      this.hasta = startIndex + this.itemsPerPage;
      this.searchResults = temp.slice(startIndex, this.hasta);
      return of(this.searchResults.slice(startIndex, this.hasta));
    } else {
      temp.filter((value: { [x: string]: { toString: () => string; }; }) => {
        for (const key in value) {
          if (value[key]) {
            if (value[key].toString().toLowerCase().includes(query.toLowerCase())) {
              filteredResults.push(value);
              break;
            }
          }
        }
      });
      return of(filteredResults.slice(startIndex, this.currentPage + this.itemsPerPage));
    }
  }

  updateSearchResults(): void {
    const query = this.formsearch.value?.trim();
    if (query) {
      this.filtrarUsuarios(query).subscribe(results => {
        this.searchResults = results;
      });
    } else {
      this.ejecutarFuncionAsincrona(this.filas);
    }
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.updateSearchResults();
  }

  getCellValue(row: any, column: TableColumn): string {
    if (column.customRender) {
      return column.customRender(row);
    }
    return row[column.col];
  }

  getFormControl(row: any, column: TableColumn): FormControl {
    if (!this.editFormControls[row]) {
      this.editFormControls[row] = {};
    }

    if (!this.editFormControls[row][column.col]) {
      const control = new FormControl(row[column.col]);
      this.editFormControls[row][column.col] = control;
    }

    return this.editFormControls[row][column.col];
  }

  toggleEditMode(row: any): void {
    if (this.editingRow === row) {
      this.editingRow = null;
    } else {
      this.editingRow = row;
    }
  }

  ejecutarAccionBoton(column: TableColumn, row: any) {
    if (column.buttonAction) {
      column.buttonAction(row);
    }
  }

  startEditing(row: any): void {
    this.columns.forEach(column => {
      if (column.isEditable) {
        const validationRules = column.validationRules || [];
        row[`${column.col}_control`] = new FormControl(row[column.col], validationRules);
      }
    });
    row.isEditing = true;
  }

  stopEditing(row: any): void {
    row.isEditing = false;
  }

  saveChanges(row: any): void {
    let isValid = true;
    this.columns.forEach(column => {
      if (column.isEditable && row[`${column.col}_control`]) {
        isValid = isValid && row[`${column.col}_control`].valid;
      }
    });

    if (isValid) {
      this.columns.forEach(column => {
        if (column.isEditable) {
          row[column.col] = row[`${column.col}_control`].value;
        }
      });
      row.isEditing = false;
      this.editarFunc(row);
    } else {
      console.log('Datos no válidos');
    }
  }

  getControlErrors(row: any, column: TableColumn): string[] {
    const control = row[`${column.col}_control`];
    if (!control || !control.errors) return [];

    return Object.keys(control.errors).map(errKey => {
      let message = '';
      switch (errKey) {
        case 'required':
          message = `El campo ${column.header} es obligatorio.`;
          break;
        case 'minlength':
          message = `El campo ${column.header} debe tener al menos ${control.errors['minlength'].requiredLength} caracteres.`;
          break;
        case 'maxlength':
          message = `El campo ${column.header} no puede exceder ${control.errors['maxlength'].requiredLength} caracteres.`;
          break;
        default:
          message = `Error en el campo ${column.header}.`;
      }
      return message;
    });
  }

  onSelectionChange(event: Event, row: any): void {
    const inputElement = event.target as HTMLInputElement;
    const checked = inputElement.checked;

    if (checked) {
      this.selectionService.addSelectedItem(row);
    } else {
      this.selectionService.removeSelectedItem(row);
    }

    this.obtenerFilasSeleccionadas(); // Asegúrate de que esta función actualiza correctamente
    console.log('Filas seleccionadas:', this.selectionService.getSelectedItems()); // Mejor usar un método que retorne los seleccionados
  }

  obtenerFilasSeleccionadas() {
    const filasSeleccionadas = this.selectionService.getSelectedItems();

    // Suponiendo que las filas actuales están disponibles en 'this.filas' (o la fuente actual de datos de la tabla)
    const filasActuales = this.filas; // Asegúrate de que 'this.filas' sea el arreglo de las filas actuales de la tabla

    // Filtrar las filas seleccionadas para asegurarse de que solo las filas existentes sean seleccionadas
    const filasValidasSeleccionadas = filasSeleccionadas.filter(fila =>
      filasActuales.some((filaActual: any) => filaActual === fila)
    );

    // Limpiar la selección
    this.selectionService.clearSelection();

    // Volver a agregar solo las filas válidas
    filasValidasSeleccionadas.forEach(fila => this.selectionService.addSelectedItem(fila));

    // Emitir las filas seleccionadas
    this.getElemSeleccionados.emit(filasValidasSeleccionadas);

    console.log('Filas seleccionadas después de la actualización:', filasValidasSeleccionadas);
  }

  ejecutarAccionUno(row: any) {
    this.accionBotonUno.emit(row);
  }

  ejecutarAccionDos(row: any) {
    this.accionBotonDos.emit(row);
  }

  ejecutarAccionTres(row: any) {
    this.accionBotonTres.emit(row);
  }

  eliminarFila(row: any) {
    this.eliminar.emit(row);
  }

  editarFila(row: any) {
    this.editar.emit(row);
  }

  onRowClick(row: any): void {
    if (this.enableRowClick) {
      this.selectedItem = row;
      this.rowClicked.emit(row);
    }
  }

  totals: any = {};
  // Método para calcular los totales
  calculateTotals() {
    this.totals = {};
    this.searchResults.forEach((row: { [x: string]: string; }) => {
      this.columns.forEach(col => {
        if (col.moneda) {
          if (!this.totals[col.col]) {
            this.totals[col.col] = 0;
          }
          this.totals[col.col] += parseFloat(row[col.col]) || 0;
        }
      });
    });
  }
}
