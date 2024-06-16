import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiarioBeneficiosAsignadosComponent } from './beneficiario-beneficios-asignados.component';

describe('BeneficiarioBeneficiosAsignadosComponent', () => {
  let component: BeneficiarioBeneficiosAsignadosComponent;
  let fixture: ComponentFixture<BeneficiarioBeneficiosAsignadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiarioBeneficiosAsignadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeneficiarioBeneficiosAsignadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
