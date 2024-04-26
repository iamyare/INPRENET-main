import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditColegiosMagisterialesComponent } from './edit-colegios-magisteriales.component';

describe('EditColegiosMagisterialesComponent', () => {
  let component: EditColegiosMagisterialesComponent;
  let fixture: ComponentFixture<EditColegiosMagisterialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditColegiosMagisterialesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditColegiosMagisterialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
