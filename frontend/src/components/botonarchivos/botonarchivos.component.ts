import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generateFormArchivo(): FormGroup {
  return new FormGroup({
    Archivos: new FormControl('', Validators.required),
  });
}

@Component({
  selector: 'app-botonarchivos',
  templateUrl: './botonarchivos.component.html',
  styleUrl: './botonarchivos.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () =>
        inject(ControlContainer, { skipSelf: true, host: true }),
    },
  ]
})
export class BotonarchivosComponent implements OnInit {
  public archivo: any;

  public uniqueId!: string;
  @Input() labelBoton = ""; @Input() groupName = ""
  @Output() setArchivo = new EventEmitter<any>()
  
  constructor( private fb: FormBuilder) {}
  ngOnInit(): void {
    this.uniqueId = 'archivo_' + Date.now();
  }

  onFileSelected(event: any) {
    const [file] = event.target.files; // Destructuración para obtener el primer elemento del array

    if (file) {
      const fileSize = file.size / Math.pow(1024, 2); // El tamaño del archivo viene en bytes por lo que se convierte a MB para una mejor comprensión.
        
      if (fileSize > 3) {
          
      } else {
          this.archivo = file
          this.setArchivo.emit(this.archivo);
          this.labelBoton = file.name;
      }
    }
  }
}
