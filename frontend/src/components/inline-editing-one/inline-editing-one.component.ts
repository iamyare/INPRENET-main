import { Component, Injectable, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Observable, Subject, debounceTime, distinctUntilChanged, of, switchMap, takeUntil } from 'rxjs';

import { SelectionserviceService } from '../nuevaplanilla/selectionservice.service';

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
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "5000",
      "total_deduccion_inprema": "5000",
      "monto_aplicado": "2000",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "01/01/2024 11:02:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 2,
      "DNI": "0801200012346",
      "Afiliado": "Leanne Graham",
      "tipo_persona": "Afiliado",
      "institucion": "Cooperativa Chorotega",
      "total_deduccion_terc": "5500",
      "total_deduccion_inprema": "5500",
      "monto_aplicado": "2100",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "02/01/2024 11:05:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 3,
      "DNI": "0801200012347",
      "Afiliado": "Clementine Bauch",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "6000",
      "total_deduccion_inprema": "6000",
      "monto_aplicado": "2200",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "03/01/2024 11:08:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 4,
      "DNI": "0801200012348",
      "Afiliado": "Patricia Lebsack",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "6500",
      "total_deduccion_inprema": "6500",
      "monto_aplicado": "2300",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "04/01/2024 11:11:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 5,
      "DNI": "0801200012349",
      "Afiliado": "Chelsey Dietrich",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "7000",
      "total_deduccion_inprema": "7000",
      "monto_aplicado": "2400",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "05/01/2024 11:14:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 6,
      "DNI": "0801200012350",
      "Afiliado": "Mrs. Dennis Schulist",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "7500",
      "total_deduccion_inprema": "7500",
      "monto_aplicado": "2500",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "06/01/2024 11:17:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 7,
      "DNI": "0801200012351",
      "Afiliado": "Kurtis Weissnat",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "8000",
      "total_deduccion_inprema": "8000",
      "monto_aplicado": "2600",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "07/01/2024 11:20:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 8,
      "DNI": "0801200012352",
      "Afiliado": "Nicholas Runolfsdottir V",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "8500",
      "total_deduccion_inprema": "8500",
      "monto_aplicado": "2700",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "08/01/2024 11:23:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 9,
      "DNI": "0801200012353",
      "Afiliado": "Glenna Reichert",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "9000",
      "total_deduccion_inprema": "9000",
      "monto_aplicado": "2800",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "09/01/2024 11:26:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 10,
      "DNI": "0801200012354",
      "Afiliado": "Clementina DuBuque",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "9500",
      "total_deduccion_inprema": "9500",
      "monto_aplicado": "2900",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "10/01/2024 11:29:00 PM",
      "isEdit": false,
      "isSelected":false
    },
    {
      "id": 11,
      "DNI": "0801200012355",
      "Afiliado": "Mrs. Lebsack",
      "tipo_persona": "Afiliado",
      "institucion": "BAC",
      "total_deduccion_terc": "10000",
      "total_deduccion_inprema": "10000",
      "monto_aplicado": "3000",
      "monto_TotalBeneficio":500,
      "fecha_aplicado": "11/01/2024 11:32:00 PM",
      "isEdit": false,
      "isSelected":false
    },
  ]

  formsearch = new FormControl('');
  searchResults: any[] = [];

  itemsPerPage = 5;  // Número de resultados por página
  desde = 0; hasta: number = this.itemsPerPage;
  currentPage = 0; // Página actual  // Número inicial de registros para mostrar

  @ViewChild(MatPaginator) paginator: MatPaginator | undefined;
  private destroy$: Subject<void> = new Subject<void>(); // Un observable para gestionar la destrucción del componente
  constructor(private selectionService: SelectionserviceService) {
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



  filtrarUsuarios(query: any): Observable<any[]> {
    const filteredResults = this.usersArray.filter(user =>
      user.Afiliado.toLowerCase().includes(query.toLowerCase()) ||
      user.DNI.toLowerCase().includes(query.toLowerCase()) ||
      user.institucion.toLowerCase().includes(query.toLowerCase()) ||
      user.total_deduccion_terc.toLowerCase().includes(query.toLowerCase()) ||
      user.total_deduccion_inprema.toLowerCase().includes(query.toLowerCase()) ||
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

  obtenerFilasSeleccionadas() {
    const filasSeleccionadas = this.selectionService.getSelectedItems();
    console.log(filasSeleccionadas);
  }

  // En tu componente
onSelectionChange(user: any) {
  if (user.isSelected) {
      this.selectionService.addSelectedItem(user);
  } else {
      this.selectionService.removeSelectedItem(user);
  }
}

}
