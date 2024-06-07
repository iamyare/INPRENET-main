import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Admin {
  name: string;
  email: string;
  password: string;
}

@Component({
  selector: 'app-add-admin',
  templateUrl: './add-admin.component.html',
  styleUrl: './add-admin.component.scss'
})
export class AddAdminComponent implements OnInit {
  userForm: FormGroup;

  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    this.userForm = this.fb.group({
      nombreEmpleado: ['', Validators.required],
      nombrePuesto: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      numeroEmpleado: ['', Validators.required],
      idRole: ['', Validators.required]
    });
  }

  ngOnInit(): void { }

  onSubmit(): void {
    if (this.userForm.valid) {
      const newUser = this.userForm.value;
      console.log('Nuevo usuario:', newUser);
      this.snackBar.open('Usuario creado exitosamente', 'Cerrar', {
        duration: 3000
      });
      this.userForm.reset();
    } else {
      this.snackBar.open('Por favor completa todos los campos correctamente', 'Cerrar', {
        duration: 3000
      });
    }
  }
}
