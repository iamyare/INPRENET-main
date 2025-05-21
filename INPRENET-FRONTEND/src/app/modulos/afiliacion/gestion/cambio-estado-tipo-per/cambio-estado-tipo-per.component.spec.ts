import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CambioEstadoTipoPerComponent } from './cambio-estado-tipo-per.component';

describe('CambioEstadoTipoPerComponent', () => {
  let component: CambioEstadoTipoPerComponent;
  let fixture: ComponentFixture<CambioEstadoTipoPerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CambioEstadoTipoPerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CambioEstadoTipoPerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
