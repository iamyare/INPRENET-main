import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SharedFormFieldsComponent } from './shared-form-fields.component';

describe('SharedFormFieldsComponent', () => {
  let component: SharedFormFieldsComponent;
  let fixture: ComponentFixture<SharedFormFieldsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedFormFieldsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SharedFormFieldsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
