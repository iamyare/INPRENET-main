import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFamiliaresCompComponent } from './edit-familiares-comp.component';

describe('EditFamiliaresCompComponent', () => {
  let component: EditFamiliaresCompComponent;
  let fixture: ComponentFixture<EditFamiliaresCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFamiliaresCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditFamiliaresCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
