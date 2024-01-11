import { Component, OnInit } from '@angular/core';
import { PlanillaService } from 'src/app/services/planilla.service';

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
  isEdit: boolean;
}

@Component({
  selector: 'app-inline-editing-one',
  templateUrl: './inline-editing-one.component.html',
  styleUrls: ['./inline-editing-one.component.css']
})
export class InlineEditingOneComponent implements OnInit {

  usersArray: any = []; // Inicializa el array vacío para que se llene con los datos del servicio

  constructor(private planillaService: PlanillaService) { }

  ngOnInit(): void {
    this.planillaService.currentUsers.subscribe(users => {
      if (users && users.length > 0) {
        console.log(users);

        this.usersArray = users;
      }
    });
  }

  onEdit(item: User) { // Usa la interfaz User para tipar el parámetro item
    this.usersArray.forEach((element: { isEdit: boolean; }) => {
      element.isEdit = false;
    });
    item.isEdit = true;
  }
}
