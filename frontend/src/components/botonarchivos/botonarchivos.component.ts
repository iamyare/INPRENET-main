import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, inject } from '@angular/core';
import { ControlContainer, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export function generateFormArchivo(label?:any): FormGroup {
  return new FormGroup({
    Archivos: new FormControl("", Validators.required),
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

  @Input() labelBoton: any = ""; 
  @Input() datos: any; 
  @Input() groupName = ""

  @Output() setArchivo = new EventEmitter<any>()
  
  constructor( private fb: FormBuilder) {
    this.fb.group({
      Archivos: [null, Validators.required],
    });
  }
  ngOnInit(): void {
    
    
    this.prueba()
    
    this.uniqueId = 'archivo_' + Date.now();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0]; // Destructuración para obtener el primer elemento del array

    if (file) {
      const fileSize = file.size / Math.pow(1024, 2); // El tamaño del archivo viene en bytes por lo que se convierte a MB para una mejor comprensión.
        
      if (fileSize > 3) {
          
      } else {
        if(this.datos?.Archivos){
          this.archivo = this.datos?.Arch;
          this.labelBoton = this.archivo.name
        }else{
          this.archivo = file
          this.labelBoton = file?.name;
        }
        this.setArchivo.emit(this.archivo);
      }
    }
  }

  prueba():any{
    this.setArchivo.emit(this.archivo);
    if(this.datos?.value?.Arch){
      this.archivo = this.datos?.value?.Arch;
      this.labelBoton = this.archivo?.name
    }    
  }
}
