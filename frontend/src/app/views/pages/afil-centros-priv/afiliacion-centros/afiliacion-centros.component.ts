import { Component } from '@angular/core';
import { FieldConfig } from 'src/app/shared/Interfaces/field-config';

@Component({
  selector: 'app-afiliacion-centros',
  templateUrl: './afiliacion-centros.component.html',
  styleUrls: ['./afiliacion-centros.component.scss']
})
export class AfiliacionCentrosComponent {
  steps = [
    { label: 'Datos Generales De Centros', isActive: true },
    { label: 'Referencias Bancarias Y Comerciales', isActive: false },
    { label: 'Sociedades', isActive: false },
    { label: 'Socios', isActive: false },
    { label: 'Administración del Centro Educativo', isActive: false },
    { label: 'Declaración de Persona Políticamente Expuesta', isActive: false },
    { label: 'Finalizar', isActive: false },
  ];

  activeStep = 0;

  fieldsStep5: FieldConfig[] = [
    {
      name: 'pep_declaration',
      label: '¿Alguno de los socios o propietario ha desempeñado o ha desempeñado un cargo público?',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      display: true,
      validations: [],
      row: 1,
      col: 12
    },
    {
      name: 'pep_nombre_apellidos',
      label: 'Nombre y Apellidos',
      type: 'text',
      value: '',
      display: true,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'pep_cargo_desempenado',
      label: 'Cargo Desempeñado',
      type: 'text',
      value: '',
      display: true,
      validations: [],
      row: 2,
      col: 6
    },
    {
      name: 'pep_periodo',
      label: 'Periodo',
      type: 'text',
      value: '',
      display: true,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'pep_otras_referencias',
      label: 'Otras Referencias',
      type: 'text',
      value: '',
      display: true,
      validations: [],
      row: 3,
      col: 6
    },
    {
      name: 'docente_deducciones',
      label: 'HA REALIZADO DEDUCCIONES DE COTIZACIONES A LOS DOCENTES QUE TRABAJAN EN LA INSTITUCIÓN:',
      type: 'radio',
      options: [
        { label: 'Sí', value: 'si' },
        { label: 'No', value: 'no' }
      ],
      value: '',
      display: true,
      validations: [],
      row: 4,
      col: 12
    }
  ];

  handleStepChange(index: number) {
    this.activeStep = index;
  }

  onDatosBenChange(formValues: any) {
    console.log('Valores del formulario:', formValues);
  }
}
