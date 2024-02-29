import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { generateFormArchivo } from 'src/components/botonarchivos/botonarchivos.component';
import { AuthService } from 'src/app/services/auth.service';
import { TipoIdentificacionService } from '../../../../services/tipo-identificacion.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pre-register',
  templateUrl: './pre-register.component.html',
  styleUrl: './pre-register.component.scss'
})
export class PreRegisterComponent implements OnInit{
  form: FormGroup;
  formArchivo = this.fb.group({
    Archivos: generateFormArchivo()
  })

  tipoIdent: any = [];
  tipoRol: any = [];

  constructor(
    private fb: FormBuilder,
    private tipoIdentificacionService : TipoIdentificacionService,
    private authSvc : AuthService,
    private toastr: ToastrService
    ) {
    this.form = this.fb.group({
     correo: ['', [Validators.required, Validators.email]],
     rol: ['', [Validators.required]],
     tipoIdent: ['', [Validators.required]],
     numeroIden: ['', [Validators.required]],
     nombrecomp: ['', [Validators.required]],
   });

   this.tipoRol = [
     {
       "idRol":2,
       "value": "JEFE DE AREA"
     },
     {
       "idRol":3,
       "value": "OFICIAL"
     },
     {
       "idRol":4,
       "value": "AUXILIAR"
     },
   ]
  }

  ngOnInit() {
    this.tipoIdentificacionService.obtenerTiposIdentificacion().subscribe(data => {
      this.tipoIdent = data;
    });
  }

  crearCuenta(){
    if (this.form.valid) {
      const formData = {
        correo: this.form.value.correo,
        nombre_rol: this.form.value.rol,
        tipo_identificacion: this.form.value.tipoIdent,
        numero_identificacion: this.form.value.numeroIden,
        nombre_empleado: this.form.value.nombrecomp,
        archivo_identificacion: "Aqui_va_el_procesamiento_del_archivo_si_es_necesario"
      };
      this.authSvc.crearCuenta(formData).subscribe({
        next: (res) => {
          this.toastr.success('Cuenta creada exitosamente!', 'Éxito');
          this.form.reset();
          this.formArchivo.reset();
        },
        error: (err) => {
          this.toastr.error('Error al crear la cuenta', 'Error');
        }
      });
    } else {
      console.error('El formulario no es válido');
      this.toastr.error('El formulario no es válido', 'Error');
    }
  }

}
