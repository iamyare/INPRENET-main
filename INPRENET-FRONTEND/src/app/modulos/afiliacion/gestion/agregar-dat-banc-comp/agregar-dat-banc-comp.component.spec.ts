import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarDatBancCompComponent } from './agregar-dat-banc-comp.component';

describe('AgregarDatBancCompComponent', () => {
  let component: AgregarDatBancCompComponent;
  let fixture: ComponentFixture<AgregarDatBancCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarDatBancCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarDatBancCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
