import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeneficiarioSinCausanteComponent } from './beneficiario-sin-causante.component';

describe('BeneficiarioSinCausanteComponent', () => {
  let component: BeneficiarioSinCausanteComponent;
  let fixture: ComponentFixture<BeneficiarioSinCausanteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeneficiarioSinCausanteComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BeneficiarioSinCausanteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
