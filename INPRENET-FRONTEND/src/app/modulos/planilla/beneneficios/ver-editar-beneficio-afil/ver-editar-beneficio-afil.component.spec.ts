import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerEditarBeneficioAfilComponent } from './ver-editar-beneficio-afil.component';

describe('VerEditarBeneficioAfilComponent', () => {
  let component: VerEditarBeneficioAfilComponent;
  let fixture: ComponentFixture<VerEditarBeneficioAfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerEditarBeneficioAfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerEditarBeneficioAfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
