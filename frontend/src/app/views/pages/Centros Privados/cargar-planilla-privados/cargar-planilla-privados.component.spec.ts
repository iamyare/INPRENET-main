import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarPlanillaPrivadosComponent } from './cargar-planilla-privados.component';

describe('CargarPlanillaPrivadosComponent', () => {
  let component: CargarPlanillaPrivadosComponent;
  let fixture: ComponentFixture<CargarPlanillaPrivadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargarPlanillaPrivadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CargarPlanillaPrivadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
