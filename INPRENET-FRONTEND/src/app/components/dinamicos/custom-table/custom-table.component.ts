import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-custom-table',
  templateUrl: './custom-table.component.html',
  styleUrls: ['./custom-table.component.scss'],
})
export class CustomTableComponent implements OnChanges {
  @Input() columns: { header: string; col: string; moneda?: boolean; hasFilter?: boolean }[] = [];
  @Input() isLoading = false;
  @Input() titulo = '';
  @Input() subtitulo = '';

  private _data: any[] = [];
  @Input() set data(value: any[]) {
    this._data = value || [];
    this.filterData();
    this.updatePaginatedData();  
  }
  get data(): any[] {
    return this._data;
  }

  paginatedData: any[] = [];
  searchResults: any[] = [];
  pageSize = 10;
  currentPage = 0;

  searchControl = new FormControl('');
  columnFilters: { [key: string]: FormControl } = {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) {
      this.initializeColumnFilters();
      this.filterData(); 
    }
  }

  ngOnInit(): void {
    this.searchControl.valueChanges.subscribe(() => this.filterData());
  }

  initializeColumnFilters(): void {
    this.columns.forEach((col) => {
      if (!this.columnFilters[col.col]) {
        this.columnFilters[col.col] = new FormControl('');
        this.columnFilters[col.col].valueChanges.subscribe(() => this.filterData());
      }
    });
  }

  filterData(): void {
    const query = this.searchControl.value?.toLowerCase() || '';
    const filteredBySearch = this._data.filter((item) =>
      Object.values(item).some((value) =>
        value?.toString().toLowerCase().includes(query)
      )
    );

    const filteredByColumns = filteredBySearch.filter((item) => {
      return this.columns.every((col) => {
        const filterValue = this.columnFilters[col.col]?.value?.toLowerCase() || '';
        return filterValue === '' || item[col.col]?.toString().toLowerCase().includes(filterValue);
      });
    });

    this.searchResults = filteredByColumns;
    this.updatePaginatedData();
  }

  updatePaginatedData(): void {
    const startIndex = this.currentPage * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedData = this.searchResults.slice(startIndex, endIndex);
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex;
    this.updatePaginatedData();
  }
}
