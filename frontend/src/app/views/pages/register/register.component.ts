  import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  form: FormGroup;
  
  preguntaSeguridad: any = [];
  filteredLibraries: any = []
  
  ocultaPregunta:boolean = false;
  ocultaPregunta2:boolean = false;
  //preguntaseguridadv:string = "";
  //preguntaseguridad1 = new FormControl();

  constructor( private fb: FormBuilder) {
  
     this.form = this.fb.group({
      preguntaseguridad1: ['', [Validators.required]],
      preguntaseguridad2: ['', [Validators.required]],
      preguntaseguridad3: ['', [Validators.required]]
    });
    
    this.preguntaSeguridad = [
      {
        "id":"preguntaseguridad1",
        "pregunta": "¿Cuál es tu animal favorito?"
      },
      {
        "id":"preguntaseguridad2",
        "pregunta": "¿Cuál es tu pasatiempo favorito?"
      },
      {
        "id":"preguntaseguridad3",
        "pregunta": "¿En que ciudad te gustaría vivir?"
      }
    ]
  
  }

  prueba1(da:any){
    console.log(da);
    
    this.ocultaPregunta = true;
    this.filteredLibraries = this.preguntaSeguridad.filter((item:any) => 
        item.id !== da.form.controls.preguntaseguridad1.value
    )
  }

  crearCuenta(){
    console.log(this.form);
    /* console.log(this.form); */
    
  }
}
