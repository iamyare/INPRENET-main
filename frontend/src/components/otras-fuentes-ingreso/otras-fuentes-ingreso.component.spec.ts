import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtrasFuentesIngresoComponent } from './otras-fuentes-ingreso.component';

describe('OtrasFuentesIngresoComponent', () => {
  let component: OtrasFuentesIngresoComponent;
  let fixture: ComponentFixture<OtrasFuentesIngresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OtrasFuentesIngresoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OtrasFuentesIngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
