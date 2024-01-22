import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ValidatorFn } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { Observable, Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrls: ['./dynamic-table.component.scss']
})
export class DynamicTableComponent implements OnInit, OnDestroy {
  @Input() columns: TableColumn[] = [];
  @Input() filas: any[] = [];
  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;

  private destroy$: Subject<void> = new Subject<void>();

  formsearch = new FormControl('');
  searchResults: any = [];

  itemsPerPage = 2;
  pageSizeOptions: number[] = [5, 10, 1000, 2000, 5000, 10000];
  pageSize: number = this.pageSizeOptions[0];
  currentPage = 0;
  desde = 0; hasta: number = this.pageSize;

  editingRow: any | null = null;
  editFormControls: { [rowKey: string]: { [colKey: string]: FormControl } } = {};
  editableRows: any[] = []

  constructor() {
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

  ngOnInit(): void {
    this.searchResults = this.filas.map(fila => ({
      ...fila,
      isEditing: false
    }));
    this.updateSearchResults();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   filtrarUsuarios(query: any): Observable<any[]> {
     let filteredResults: any = []

     this.filas.filter(value => {

       for (const key in value) {
         if (value[key].toString().toLowerCase().includes(query.toLowerCase())) {
          filteredResults.push(value); break
        }
      }
    });

    const startIndex = this.currentPage * this.itemsPerPage;
    return of(filteredResults.slice(startIndex, startIndex + this.itemsPerPage));
  }

  updateSearchResults(): void {
    this.filtrarUsuarios(this.formsearch.value?.trim())
      .subscribe(results => {
        if (results.length != 0){
          return this.searchResults = results
        }else{
          return this.searchResults = this.filas
        }
      });
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
        // Agrega aquí más casos según las validaciones que uses
        default:
          message = `Error en el campo ${column.header}.`;
      }
      return message;
    });
  }
}

interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
  isButton?: boolean;
  buttonAction?: (row: any) => void;
  buttonText?: string;
  isEditable?: boolean;
  validationRules?: ValidatorFn[];
}
