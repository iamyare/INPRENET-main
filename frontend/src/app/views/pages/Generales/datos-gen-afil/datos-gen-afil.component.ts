/* <!-- ESTE NO SE ESTA OCUPANDO --> */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { PageEvent, MatPaginator } from '@angular/material/paginator';
import { FormBuilder } from '@angular/forms';
import { generateAddressFormGroup } from 'src/components/dat-generales-afiliado/dat-generales-afiliado.component';
import { generateDatBancFormGroup } from 'src/components/dat-banc/dat-banc.component';
import { AfiliadoService } from 'src/app/services/afiliado.service';

@Component({
  selector: 'app-datos-gen-afil',
  templateUrl: './datos-gen-afil.component.html',
  styleUrls: ['./datos-gen-afil.component.scss']
})
export class DatosGenAfilComponent implements OnInit {
  datosGen: any;
  form = this.fb.group({
    /* DatosGenerales: generateAddressFormGroup(), */
    DatosBacAfil: generateDatBancFormGroup(),
    datosBeneficiario: generateAddressFormGroup(),
  });

  @ViewChild(MatPaginator) matPaginator: MatPaginator | undefined;

  ELEMENT_DATA: any[] = [];
  public informacion: any = [];

  dataSource = new MatTableDataSource<any>(this.ELEMENT_DATA);

  nombreBusqueda: string = '';
  pageSize = 5;
  desde = 0;
  hasta: number = this.pageSize;
  formDatosGenerales: any

  constructor(private afiliadoService: AfiliadoService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.obtenerAfiliados();
  }
  setDatosGen(datosGen: any) {
    this.datosGen = datosGen;
  }
  setDatosGenerales(datosGenerales: any) {
    this.formDatosGenerales = datosGenerales
  }

  obtenerAfiliados() {
    this.afiliadoService.getAllAfiliados().subscribe(
      (res: any) => {
        if (res.ok) {
          this.informacion = res.afiliados;
          this.dataSource.data = this.informacion.slice(0, this.pageSize);
          this.actualizarPaginador();
        }
      },
      (error) => {
        console.error('Error al obtener afiliados', error);
      }
    );
  }

  @Input() dataEntrante: any;
  editarCentroTrabajo(centroTrabajo: any) {
    this.dataEntrante = centroTrabajo;
    console.log(this.formDatosGenerales);

    /* this.form.get('DatosGenerales.representacion')?.setValue(this.dataEntrante.REPRESENTACION);
    this.form.get('DatosGenerales.telefono1')?.setValue(this.dataEntrante.TELEFONO_1);
    this.form.get('DatosGenerales.telefono2')?.setValue(this.dataEntrante.TELEFONO_2);
    this.form.get('DatosGenerales.primerNombre')?.setValue(this.dataEntrante.PRIMER_NOMBRE);
    this.form.get('DatosGenerales.segundoNombre')?.setValue(this.dataEntrante.SEGUNDO_NOMBRE);
    this.form.get('DatosGenerales.tercerNombre')?.setValue(this.dataEntrante.TERCER_NOMBRE);
    this.form.get('DatosGenerales.primerApellido')?.setValue(this.dataEntrante.PRIMER_APELLIDO);
    this.form.get('DatosGenerales.segundoApellido')?.setValue(this.dataEntrante.SEGUNDO_APELLIDO);
    this.form.get('DatosGenerales.fechaNacimiento')?.setValue(this.dataEntrante.FECHA_NACIMIENTO);
    this.form.get('DatosGenerales.estado')?.setValue(this.dataEntrante.ESTADO);
    this.form.get('DatosGenerales.estadoCivil')?.setValue(this.dataEntrante.ESTADO_CIVIL);
    this.form.get('DatosGenerales.cotizante')?.setValue(this.dataEntrante.TIPO_COTIZANTE);
    this.form.get('DatosGenerales.genero')?.setValue(this.dataEntrante.GENERO);
    this.form.get('DatosGenerales.profesion')?.setValue(this.dataEntrante.PROFESION);
    this.form.get('DatosGenerales.cantidadHijos')?.setValue(this.dataEntrante.CANTIDAD_HIJOS);
    this.form.get('DatosGenerales.cantidadDependientes')?.setValue(this.dataEntrante.CANTIDAD_DEPENDIENTES);
    this.form.get('DatosGenerales.numeroIden')?.setValue(this.dataEntrante.DNI);
    this.form.get('DatosGenerales.correo1')?.setValue(this.dataEntrante.CORREO_1);
    this.form.get('DatosGenerales.correo2')?.setValue(this.dataEntrante.CORREO_2);
    this.form.get('DatosGenerales.direccionDetallada')?.setValue(this.dataEntrante.DIRECCION_RESIDENCIA);
    this.form.get('DatosGenerales.tipoIdent')?.setValue(this.dataEntrante.TIPO_IDENTIFICACION);

    this.form.get('DatosGenerales.ciudadNacimiento')?.setValue("");
    this.form.get('DatosGenerales.ciudadDomicilio')?.setValue("");
    this.form.get('DatosGenerales.archIdent')?.setValue("");   */
    /* this.afiliadoService.afiliadosEdit.emit({
      data: this.dataEntrante
    }); */
  }

  aplicarFiltroNombre() {
    this.dataSource.filter = this.nombreBusqueda.trim().toLowerCase();
  }

  onPageChange(e: PageEvent): void {
    this.desde = e.pageIndex * e.pageSize;
    this.hasta = this.desde + e.pageSize;
    this.dataSource.data = this.informacion.slice(this.desde, this.hasta);
  }

  private actualizarPaginador() {
    if (this.matPaginator) {
      this.matPaginator.length = this.informacion.length;
      this.matPaginator.pageSize = this.pageSize;
    }
  }
}
