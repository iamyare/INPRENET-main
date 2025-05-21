import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarBeneficiariosComponent } from './agregar-beneficiarios.component';

describe('AgregarBeneficiariosComponent', () => {
  let component: AgregarBeneficiariosComponent;
  let fixture: ComponentFixture<AgregarBeneficiariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarBeneficiariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarBeneficiariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
