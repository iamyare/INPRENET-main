import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Observable, Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';

@Component({
  selector: 'app-inline-editing-one',
  templateUrl: './inline-editing-one.component.html',
  styleUrls: ['./inline-editing-one.component.css']
})
export class InlineEditingOneComponent implements OnInit, OnDestroy  {
  usersArray = [
    {
      "id": 1,
      "DNI": "0801200012345",
      "Afiliado": "Leanne Graham",
      "institucion": "BAC",
      "total_deduccion": "5000",
      "monto_aplicado": "2000",
      "fecha_aplicado": "01/01/2024 11:02:00 PM",
      "isEdit": false
    },
    {
      "id": 2,
      "DNI": "0801200012346",
      "Afiliado": "Leanne Graham",
      "institucion": "Cooperativa Chorotega",
      "total_deduccion": "5500",
      "monto_aplicado": "2100",
      "fecha_aplicado": "02/01/2024 11:05:00 PM",
      "isEdit": false
    },
    {
      "id": 3,
      "DNI": "0801200012347",
      "Afiliado": "Clementine Bauch",
      "institucion": "BAC",
      "total_deduccion": "6000",
      "monto_aplicado": "2200",
      "fecha_aplicado": "03/01/2024 11:08:00 PM",
      "isEdit": false
    },
    {
      "id": 4,
      "DNI": "0801200012348",
      "Afiliado": "Patricia Lebsack",
      "institucion": "BAC",
      "total_deduccion": "6500",
      "monto_aplicado": "2300",
      "fecha_aplicado": "04/01/2024 11:11:00 PM",
      "isEdit": false
    },
    {
      "id": 5,
      "DNI": "0801200012349",
      "Afiliado": "Chelsey Dietrich",
      "institucion": "BAC",
      "total_deduccion": "7000",
      "monto_aplicado": "2400",
      "fecha_aplicado": "05/01/2024 11:14:00 PM",
      "isEdit": false
    },
    {
      "id": 6,
      "DNI": "0801200012350",
      "Afiliado": "Mrs. Dennis Schulist",
      "institucion": "BAC",
      "total_deduccion": "7500",
      "monto_aplicado": "2500",
      "fecha_aplicado": "06/01/2024 11:17:00 PM",
      "isEdit": false
    },
    {
      "id": 7,
      "DNI": "0801200012351",
      "Afiliado": "Kurtis Weissnat",
      "institucion": "BAC",
      "total_deduccion": "8000",
      "monto_aplicado": "2600",
      "fecha_aplicado": "07/01/2024 11:20:00 PM",
      "isEdit": false
    },
    {
      "id": 8,
      "DNI": "0801200012352",
      "Afiliado": "Nicholas Runolfsdottir V",
      "institucion": "BAC",
      "total_deduccion": "8500",
      "monto_aplicado": "2700",
      "fecha_aplicado": "08/01/2024 11:23:00 PM",
      "isEdit": false
    },
    {
      "id": 9,
      "DNI": "0801200012353",
      "Afiliado": "Glenna Reichert",
      "institucion": "BAC",
      "total_deduccion": "9000",
      "monto_aplicado": "2800",
      "fecha_aplicado": "09/01/2024 11:26:00 PM",
      "isEdit": false
    },
    {
      "id": 10,
      "DNI": "0801200012354",
      "Afiliado": "Clementina DuBuque",
      "institucion": "BAC",
      "total_deduccion": "9500",
      "monto_aplicado": "2900",
      "fecha_aplicado": "10/01/2024 11:29:00 PM",
      "isEdit": false
    },
    {
      "id": 11,
      "DNI": "0801200012355",
      "Afiliado": "Mrs. Lebsack",
      "institucion": "BAC",
      "total_deduccion": "10000",
      "monto_aplicado": "3000",
      "fecha_aplicado": "11/01/2024 11:32:00 PM",
      "isEdit": false
    },
  ]

  formsearch = new FormControl('');
  searchResults: any[] = [];

  pageSizeOptions: number[] = [5, 10, 1000,2000,5000,10000];
  pageSize: number = this.pageSizeOptions[0];
  pageIndex: number = 0;

  desde = 0; hasta: number = this.pageSize;

  currentPage = 0; // Página actual
  initialDisplayCount = 1;  // Número inicial de registros para mostrar
  itemsPerPage = 5;  // Número de resultados por página

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  private destroy$: Subject<void> = new Subject<void>(); // Un observable para gestionar la destrucción del componente
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

  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onEdit(item: any) {
    debugger;
    this.usersArray.forEach(element => {
      element.isEdit = false;
    });
    item.isEdit = true;
  }

  getPages(): number[] {
    const totalPages = Math.ceil(this.usersArray.length / this.itemsPerPage);
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  filtrarUsuarios(query: any): Observable<any[]> {
    const filteredResults = this.usersArray.filter(user =>
      user.Afiliado.toLowerCase().includes(query.toLowerCase()) ||
      user.DNI.toLowerCase().includes(query.toLowerCase()) ||
      user.institucion.toLowerCase().includes(query.toLowerCase()) ||
      user.total_deduccion.toLowerCase().includes(query.toLowerCase()) ||
      user.monto_aplicado.toLowerCase().includes(query.toLowerCase()) ||
      user.fecha_aplicado.toLowerCase().includes(query.toLowerCase())
    );

    const startIndex = this.currentPage * this.itemsPerPage;
    return of(filteredResults.slice(startIndex, startIndex + this.itemsPerPage));
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

@Injectable()
export class CustomMatPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Elementos por página:';
  override nextPageLabel = 'Siguiente página';
  override previousPageLabel = 'Página anterior';
  override firstPageLabel = 'Primera página';
  override lastPageLabel = 'Última página';

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 de ${length}`;
    }

    length = Math.max(length, 0);

    const startIndex = page * pageSize;

    const endIndex = startIndex < length ?
      Math.min(startIndex + pageSize, length) :
      startIndex + pageSize;

    return `${startIndex + 1} - ${endIndex} de ${length}`;
  };
}
