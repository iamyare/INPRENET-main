import { Component, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil } from 'rxjs/operators';
import { SelectionserviceService } from 'src/app/services/selectionservice.service';
import { TableColumn } from 'src/app/shared/Interfaces/table-column';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnInit, OnDestroy {
  @Input() verOpcEditar: boolean = false;
  @Input() verBotEditar: boolean = false;
  @Output() getElemSeleccionados = new EventEmitter<any>()

  @Input() getData?: any;
  @Input() data?: any;
  filas: any = [];

  @Output() ejecutarFuncionAsincronaEvent: EventEmitter<(param: any) => Promise<boolean>> = new EventEmitter<(param: any) => Promise<boolean>>();

  @Input() columns: TableColumn[] = [];
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
  @Input() mostrarBotonInhabilitar: boolean = false; // Nuevo @Input para visibilidad del botón
  @Output() eliminar: EventEmitter<any> = new EventEmitter<any>();
  @Output() editar: EventEmitter<any> = new EventEmitter<any>();
  @Output() inhabilitar: EventEmitter<any> = new EventEmitter<any>(); // Nuevo @Output para la acción de inhabilitar

  @Input() titulo = "";
  @Input() subtitulo = "";

  @Input() enableRowClick: boolean = false;
  @Output() rowClicked: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  private destroy$: Subject<void> = new Subject<void>();

  formsearch = new FormControl('');
  searchResults: any = [];

  itemsPerPage = 20;  // Número de resultados por página
  desde = 0; hasta: number = this.itemsPerPage;
  currentPage = 0;

  editingRow: any | null = null;
  editFormControls: { [rowKey: string]: { [colKey: string]: FormControl } } = {};
  editableRows: any[] = []
  mostrar: boolean = false;

  constructor(private selectionService: SelectionserviceService) {

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
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  public async ejecutarFuncionAsincrona(data: any): Promise<boolean> {
    if (data) {
      this.filas = data;
      this.filas?.map((objeto: any) => ({ ...objeto, isSelected: false }));
      this.filtrarUsuarios().subscribe();
      this.mostrar = true
      return true
    } else {
      this.filas = await this.getData();
      this.mostrar = false
      this.filtrarUsuarios().subscribe();
      return false
    }
  }

  ngOnInit(): void {
    this.ejecutarFuncionAsincronaEvent.emit(this.ejecutarFuncionAsincrona.bind(this));
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
      // Realizar la búsqueda y devolver resultados filtrados
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
      // Si hay un valor en el buscador, realizar la búsqueda y actualizar resultados
      this.filtrarUsuarios(query).subscribe(results => {
        this.searchResults = results;
      });
    } else {
      // Si el buscador está vacío, cargar todos los resultados sin filtrar
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
      // Lógica para guardar los cambios
      this.columns.forEach(column => {
        if (column.isEditable) {
          row[column.col] = row[`${column.col}_control`].value;
        }
      });
      row.isEditing = false;
      this.editarFunc(row);
    } else {
      // Manejar caso de datos no válidos
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

  onSelectionChange(user: any) {
    if (user.isSelected) {
      this.selectionService.addSelectedItem(user);
    } else {
      this.selectionService.removeSelectedItem(user);
    }
    this.obtenerFilasSeleccionadas();
  }

  obtenerFilasSeleccionadas() {
    const filasSeleccionadas = this.selectionService.getSelectedItems();
    this.getElemSeleccionados.emit(filasSeleccionadas);
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

  inhabilitarFila(row: any) {
    this.inhabilitar.emit(row); // Emitir el evento de inhabilitación
  }

  onRowClick(row: any): void {
    if (this.enableRowClick) {
      this.rowClicked.emit(row);
    }
  }
}
