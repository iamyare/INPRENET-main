import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IngresarAsistenciaComponent } from './ingresar-asistencia.component';

describe('IngresarAsistenciaComponent', () => {
  let component: IngresarAsistenciaComponent;
  let fixture: ComponentFixture<IngresarAsistenciaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IngresarAsistenciaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IngresarAsistenciaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
