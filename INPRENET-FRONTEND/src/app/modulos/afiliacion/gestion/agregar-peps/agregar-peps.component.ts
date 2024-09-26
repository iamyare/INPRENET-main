import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, AbstractControl } from '@angular/forms';
import { AfiliacionService } from 'src/app/services/afiliacion.service';
import { ToastrService } from 'ngx-toastr';  // Para notificaciones de éxito o error
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';  // Para cerrar el diálogo si es necesario y recibir data
import { FieldArrays } from 'src/app/shared/Interfaces/field-arrays';

@Component({
  selector: 'app-agregar-peps',
  templateUrl: './agregar-peps.component.html',
  styleUrls: ['./agregar-peps.component.scss']
})
export class AgregarPepsComponent implements OnInit {
  formPeps!: FormGroup;

  fields: FieldArrays[] = [
    {
      name: 'pep_cargo_desempenado',
      label: 'Cargo Desempeñado',
      type: 'text',
      icon: 'work',
      value: '',
      validations: [Validators.required],
      layout: { row: 1, col: 6 }
    },
    {
      name: 'dateRange',
      label: 'Periodo',
      type: 'dateRange',
      icon: 'date_range',
      startDateControlName: 'startDate',
      endDateControlName: 'endDate',
      layout: { row: 1, col: 6 }
    }
  ];

  constructor(
    private fb: FormBuilder,
    private afiliacionService: AfiliacionService,
    private toastr: ToastrService,
    private dialogRef: MatDialogRef<AgregarPepsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { idPersona: number }
  ) {}

  ngOnInit(): void {
    this.formPeps = this.fb.group({
      peps: this.fb.array([])
    });
  }

  get peps(): FormArray {
    return this.formPeps.get('peps') as FormArray;
  }

  addReferencia(): void {
    const referenciaGroup = this.fb.group({
      pep_cargo_desempenado: new FormControl('', Validators.required),
      startDate: new FormControl(null, Validators.required),
      endDate: new FormControl(null)
    });
    this.peps.push(referenciaGroup);
  }

  removeReferencia(index: number): void {
    this.peps.removeAt(index);
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  // Método para formatear los PEPs
  private formatPeps(peps: any[]): any[] {
    return peps.map(pep => ({
      cargosPublicos: [
        {
          cargo: pep.pep_cargo_desempenado || '',
          fecha_inicio: pep.startDate || '',
          fecha_fin: pep.endDate || ''
        }
      ]
    }));
  }

  // Método para guardar los PEPs en el formato requerido
  savePeps(): void {
    if (this.formPeps.valid) {
      const formattedPeps = this.formatPeps(this.peps.value);  // Formatear los datos antes de enviarlos
      const idPersona = this.data.idPersona;  // Obtener `idPersona` desde `data`

      this.afiliacionService.crearPeps(idPersona, formattedPeps).subscribe({
        next: () => {
          this.toastr.success('PEPs guardados exitosamente');
          this.dialogRef.close();  // Cerrar el diálogo si la operación es exitosa
        },
        error: (error) => {
          this.toastr.error('Error al guardar los PEPs');
          console.error('Error al guardar los PEPs:', error);
        }
      });
    } else {
      this.toastr.error('Por favor, completa todos los campos requeridos');
    }
  }
}
