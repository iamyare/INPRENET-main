import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialAngularModule } from '../material-angular/material-angular.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ViewsRoutingModule } from './views-routing.module';



@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    MaterialAngularModule,
    ViewsRoutingModule
  ]
})
export class ViewsModule { }
