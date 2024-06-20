import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DireccionService } from 'src/app/services/direccion.service';

@Component({
  selector: 'app-admin-centro-educativo',
  templateUrl: './admin-centro-educativo.component.html',
  styleUrls: ['./admin-centro-educativo.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCentroEducativoComponent implements OnInit {
  @Input() parentForm!: FormGroup;
  departamentos: any = [];
  municipios: any = [];

  constructor(private fb: FormBuilder, private direccionService: DireccionService) { }

  ngOnInit(): void {
    this.addControlsToForm();
    this.loadDepartamentos();
  }

  addControlsToForm() {
    const formControls: any = {
      administradorNombre: ['asd'],
      administradorTelefono: ['22252625'],
      administradorCorreo: ['pedro@gmail.com'],
      contadorNombre: ['Maria Del Carmen'],
      contadorTelefono: ['98866325'],
      contadorCorreo: ['maria@gmail.com'],
      propietarioNombre: ['Kenia Rodriguez'],
      propietarioColonia: ['La Miraflores'],
      propietarioBarrio: [''],
      propietarioGrupo: ['C. Roatan'],
      propietarioCasa: ['556'],
      propietarioDepartamento: ['ATLANTIDA'],
      propietarioMunicipio: ['ESPARTA'],
      propietarioTelefonoCasa: [''],
      propietarioCelular1: ['98855663'],
      propietarioCelular2: [''],
      propietarioCorreo1: ['Kenia@gmail.com'],
      propietarioCorreo2: ['KeniaRod@gmail.com'],
      propietarioReferencia: ['Atrás de la Teletón'],
    };

    for (const key in formControls) {
      if (formControls.hasOwnProperty(key)) {
        this.parentForm.addControl(key, this.fb.control(formControls[key]));
      }
    }
  }

  async loadDepartamentos() {
    this.departamentos = await this.direccionService.getAllDepartments().toPromise();

  }

  async onDepartamentoChange(event: any) {
    const departamentoId = event.value;

    this.municipios = await this.direccionService.getMunicipiosPorDepartamentoId(departamentoId).toPromise();
    this.parentForm.get('propietarioMunicipio')?.setValue(null);
  }

  onSubmit() {
    //console.log(this.parentForm.value);
  }
}
