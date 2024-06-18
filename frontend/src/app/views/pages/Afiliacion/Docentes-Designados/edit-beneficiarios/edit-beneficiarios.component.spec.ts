import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditBeneficiariosComponent } from './edit-beneficiarios.component';

describe('EditBeneficiariosComponent', () => {
  let component: EditBeneficiariosComponent;
  let fixture: ComponentFixture<EditBeneficiariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditBeneficiariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditBeneficiariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
