import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionDeduccionesComponent } from './asignacion-deducciones.component';

describe('AsignacionDeduccionesComponent', () => {
  let component: AsignacionDeduccionesComponent;
  let fixture: ComponentFixture<AsignacionDeduccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionDeduccionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignacionDeduccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
