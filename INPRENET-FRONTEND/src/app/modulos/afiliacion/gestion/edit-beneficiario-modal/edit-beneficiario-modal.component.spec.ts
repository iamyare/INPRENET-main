import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBeneficiarioModalComponent } from './edit-beneficiario-modal.component';

describe('EditBeneficiarioModalComponent', () => {
  let component: EditBeneficiarioModalComponent;
  let fixture: ComponentFixture<EditBeneficiarioModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBeneficiarioModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditBeneficiarioModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
