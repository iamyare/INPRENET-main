import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { SelectionserviceService } from '../nuevaplanilla/selectionservice.service';
import { Observable, Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';
import { MatPaginator } from '@angular/material/paginator';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-dynamic-table',
  templateUrl: './dynamic-table.component.html',
  styleUrl: './dynamic-table.component.scss'
})
export class DynamicTableComponent implements OnInit, OnDestroy{
  @Input() columns: TableColumn[] = [];
  @Input() filas: any[] = [];
  itemsPerPage = 1;

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  private destroy$: Subject<void> = new Subject<void>();

  formsearch = new FormControl('');
  currentPage = 0;
  pageSizeOptions: number[] = [5, 10, 1000,2000,5000,10000];
  pageSize: number = this.pageSizeOptions[0];
  searchResults: any= [];
  desde = 0; hasta: number = this.pageSize;

  constructor() {

    this.updateSearchResults();

    this.formsearch.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap(query => this.filtrarUsuarios(query)),
        takeUntil(this.destroy$)
      )
      .subscribe(results => {
        this.searchResults = results;
        this.currentPage = 0;  // Reinicia la página a la primera al cambiar la búsqueda
        this.paginator?.firstPage();
      });
  }

  ngOnInit(): void {
  }
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

   filtrarUsuarios(query: any): Observable<any[]> {

    let temp: any = []
    this.filas.filter(value => {
      for (const key in value) {
        if (value.hasOwnProperty(key)) {
          temp.push(value); break
        }
      }
    }
   );

   console.log(temp);


      const startIndex = this.currentPage * this.itemsPerPage;
   return of(temp.slice(startIndex, startIndex + this.itemsPerPage));
  }

  getCellValue(row: any, column: TableColumn): string {
    if (column.customRender) {
      return column.customRender(row);
    }
    return row[column.col];
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.updateSearchResults();
  }

  updateSearchResults(): void {
    this.filtrarUsuarios(this.formsearch.value?.trim())
      .subscribe(results => this.searchResults = results);
  }

}

interface TableColumn {
  header: string;
  col: string;
  customRender?: (data: any) => string;
}
