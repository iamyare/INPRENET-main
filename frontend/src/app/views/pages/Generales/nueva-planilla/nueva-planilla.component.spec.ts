import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirDeduccionesComponent } from './subir-deducciones.component';

describe('SubirDeduccionesComponent', () => {
  let component: SubirDeduccionesComponent;
  let fixture: ComponentFixture<SubirDeduccionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubirDeduccionesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SubirDeduccionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
