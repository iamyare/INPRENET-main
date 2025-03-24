import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleEnvioEscalafonComponent } from './detalle-envio-escalafon.component';

describe('DetalleEnvioEscalafonComponent', () => {
  let component: DetalleEnvioEscalafonComponent;
  let fixture: ComponentFixture<DetalleEnvioEscalafonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleEnvioEscalafonComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetalleEnvioEscalafonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
