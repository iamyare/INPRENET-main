import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiarioConstanciasComponent } from './beneficiario-constancias.component';

describe('BeneficiarioConstanciasComponent', () => {
  let component: BeneficiarioConstanciasComponent;
  let fixture: ComponentFixture<BeneficiarioConstanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiarioConstanciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeneficiarioConstanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
