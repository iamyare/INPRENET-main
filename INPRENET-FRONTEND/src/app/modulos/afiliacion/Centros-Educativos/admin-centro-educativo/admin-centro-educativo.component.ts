import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CentroEducativoService } from 'src/app/services/centro-educativo.service';
import { combineLatest } from 'rxjs';

@Component({
  selector: 'app-admin-centro-educativo',
  templateUrl: './admin-centro-educativo.component.html',
  styleUrls: ['./admin-centro-educativo.component.scss']
})
export class AdminCentroEducativoComponent implements OnInit {

  @Input() parentForm!: FormGroup

  administradorData: any;
  contadorData: any;
  propietarioData: any;
  
  constructor(private centroEducativoService: CentroEducativoService) {}

  ngOnInit(): void {
    this.centroEducativoService.administradorData$.subscribe(data => {
      this.administradorData = data;
      this.parentForm.get('datosAdministrador')?.patchValue(data || {});
    });
    this.centroEducativoService.contadorData$.subscribe(data => {
      this.contadorData = data;
      this.parentForm.get('datosContador')?.patchValue(data || {});
    });
    this.centroEducativoService.propietarioData$.subscribe(data => {
      this.propietarioData = data;
      this.parentForm.get('datosPropietario')?.patchValue(data || {});
    });
  } 
}
