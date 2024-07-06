import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDatosGeneralesComponent } from './edit-datos-generales.component';

describe('EditDatosGeneralesComponent', () => {
  let component: EditDatosGeneralesComponent;
  let fixture: ComponentFixture<EditDatosGeneralesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDatosGeneralesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditDatosGeneralesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
