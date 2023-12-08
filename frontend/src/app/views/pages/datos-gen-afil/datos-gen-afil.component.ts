import { Component, OnInit } from '@angular/core';
import { AfiliadoService } from '../../../services/afiliado.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-datos-gen-afil',
  templateUrl: './datos-gen-afil.component.html',
  styleUrls: ['./datos-gen-afil.component.scss']
})
export class DatosGenAfilComponent implements OnInit {
  ELEMENT_DATA: any[] = [];
  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);


  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;



  displayedColumns: string[] = [
    'pais_residencia',
    'pais_nacionalidad',
    'identificacion',
    'nombreCompleto',
    'fecha_nacimiento',
    'sexo',
    'cantidad_dependientes',
    'cantidad_hijos',
    'profesion',
    'representacion',
    'telefono_1',
    'telefono_2',
    'correo_1',
    'correo_2',
    'archivo_identificacion',
    'direccion_residencia',
    'estado',
    'editar'
  ];

  constructor(private afiliadoService: AfiliadoService) {}

  ngOnInit(): void {
    this.obtenerAfiliados();
  }

  obtenerAfiliados(): void {
    this.afiliadoService.getAllAfiliados().subscribe(
      (data: any[]) => {
       this.dataSource.data = data.map(item => {
          return {
            pais_residencia: item[1],
            pais_nacionalidad: item[2],
            identificacion: item[3],
            primer_nombre: item[5],
            segundo_nombre: item[6],
            tercer_nombre: item[7],
            primer_apellido: item[8],
            segundo_apellido: item[9],
            fecha_nacimiento: item[10],
            sexo: item[11],
            cantidad_dependientes: item[12],
            cantidad_hijos: item[13],
            profesion: item[14],
            representacion: item[15],
            telefono_1: item[16],
            telefono_2: item[17],
            correo_1: item[18],
            correo_2: item[19],
            archivo_identificacion: item[20],
            direccion_residencia: item[21],
            estado: item[22],
          };
        });

        this.totalItems = this.dataSource.data.length;

      },
      (error) => {
        console.error('Error al obtener afiliados', error);
      }
    );
  }

  editarCentroTrabajo(centroTrabajo: any) {
    console.log('Editar centro de trabajo:', centroTrabajo);

  }

  onPageChange(event: any) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }


}
