import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DesglosePagoComponent } from './desglose-pago.component';

describe('DesglosePagoComponent', () => {
  let component: DesglosePagoComponent;
  let fixture: ComponentFixture<DesglosePagoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DesglosePagoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DesglosePagoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
