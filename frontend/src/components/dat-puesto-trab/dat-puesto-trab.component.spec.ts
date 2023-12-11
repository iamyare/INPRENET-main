import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatPuestoTrabComponent } from './dat-puesto-trab.component';

describe('DatPuestoTrabComponent', () => {
  let component: DatPuestoTrabComponent;
  let fixture: ComponentFixture<DatPuestoTrabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatPuestoTrabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatPuestoTrabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
