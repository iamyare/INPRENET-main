import { Component, ViewChild } from '@angular/core';
import { ConasaService } from '../../../services/conasa.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-ver-consultas-medicas',
  templateUrl: './ver-consultas-medicas.component.html',
  styleUrl: './ver-consultas-medicas.component.scss',
  providers: [DatePipe]
})
export class VerConsultasMedicasComponent {
  displayedColumns: string[] = [
    'dni',
    'nombre_completo',
    'fecha_consulta',
    'motivo_consulta',
    'tipo_atencion',
    'triage',
    'diagnostico_presuntivo',
    'detalle_atencion',
    'fecha_cierre',
  ];
  dataSource = new MatTableDataSource<any>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private consultaService: ConasaService, private datePipe: DatePipe) {}

  ngOnInit(): void {
    this.consultaService.obtenerConsultasMedicas().subscribe({
      next: (data) => {
        this.dataSource.data = data.map(item => ({
          ...item,
          fecha_consulta: this.formatDate(item.fecha_consulta),
          fecha_cierre: this.formatDate(item.fecha_cierre),
          month: new Date(item.fecha_consulta).getMonth() + 1, // Extraer mes
          year: new Date(item.fecha_consulta).getFullYear()
        }));
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      },
      error: (error) => console.error('Error al obtener consultas médicas', error)
    });
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  formatDate(dateString: string | null): string {
    return dateString ? this.datePipe.transform(dateString, 'dd/MM/yyyy') || '' : '';
  }

  selectedMonth: number = new Date().getMonth() + 1; // Mes actual
  selectedYear: number = new Date().getFullYear(); // Año actual

  months = [
    { value: 1, label: "Enero" },
    { value: 2, label: "Febrero" },
    { value: 3, label: "Marzo" },
    { value: 4, label: "Abril" },
    { value: 5, label: "Mayo" },
    { value: 6, label: "Junio" },
    { value: 7, label: "Julio" },
    { value: 8, label: "Agosto" },
    { value: 9, label: "Septiembre" },
    { value: 10, label: "Octubre" },
    { value: 11, label: "Noviembre" },
    { value: 12, label: "Diciembre" }
  ];

  exportToExcel(): void {
    const filteredData = this.dataSource.data.filter(row =>
      row.month === this.selectedMonth && row.year === this.selectedYear
    );

    if (filteredData.length === 0) {
      alert("No hay datos disponibles para el mes y año seleccionados.");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(filteredData.map(row => ({
      DNI: row.dni,
      "Fecha Consulta": row.fecha_consulta,
      "Motivo Consulta": row.motivo_consulta,
      "Tipo Atención": row.tipo_atencion,
      TRIAGE: row.triage,
      Diagnóstico: row.diagnostico_presuntivo,
      Detalle: row.detalle_atencion,
      "Fecha Cierre": row.fecha_cierre,
      "Nombre Completo": row.nombre_completo
    })));

    const workbook = XLSX.utils.book_new();
    const sheetName = `${this.months[this.selectedMonth - 1].label} ${this.selectedYear}`;
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Crear el archivo Excel y descargarlo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(file, `Consultas_Medicas_${sheetName}.xlsx`);
  }
}
