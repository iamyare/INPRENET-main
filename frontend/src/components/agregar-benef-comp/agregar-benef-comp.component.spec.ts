import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarBenefCompComponent } from './agregar-benef-comp.component';

describe('AgregarBenefCompComponent', () => {
  let component: AgregarBenefCompComponent;
  let fixture: ComponentFixture<AgregarBenefCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarBenefCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarBenefCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
