import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditReferPersonalesComponent } from './edit-refer-personales.component';

describe('EditReferPersonalesComponent', () => {
  let component: EditReferPersonalesComponent;
  let fixture: ComponentFixture<EditReferPersonalesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditReferPersonalesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditReferPersonalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
