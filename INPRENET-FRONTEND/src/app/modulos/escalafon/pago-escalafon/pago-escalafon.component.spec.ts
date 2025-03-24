import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PagoEscalafonComponent } from './pago-escalafon.component';

describe('PagoEscalafonComponent', () => {
  let component: PagoEscalafonComponent;
  let fixture: ComponentFixture<PagoEscalafonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoEscalafonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagoEscalafonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
