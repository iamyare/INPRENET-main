import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditPepsComponent } from './edit-peps.component';

describe('EditPepsComponent', () => {
  let component: EditPepsComponent;
  let fixture: ComponentFixture<EditPepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditPepsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditPepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
