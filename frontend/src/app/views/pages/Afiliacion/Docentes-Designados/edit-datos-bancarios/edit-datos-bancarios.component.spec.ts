import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDatosBancariosComponent } from './edit-datos-bancarios.component';

describe('EditDatosBancariosComponent', () => {
  let component: EditDatosBancariosComponent;
  let fixture: ComponentFixture<EditDatosBancariosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDatosBancariosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditDatosBancariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
