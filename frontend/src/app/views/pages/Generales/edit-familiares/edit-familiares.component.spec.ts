import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFamiliaresComponent } from './edit-familiares.component';

describe('EditFamiliaresComponent', () => {
  let component: EditFamiliaresComponent;
  let fixture: ComponentFixture<EditFamiliaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFamiliaresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditFamiliaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
