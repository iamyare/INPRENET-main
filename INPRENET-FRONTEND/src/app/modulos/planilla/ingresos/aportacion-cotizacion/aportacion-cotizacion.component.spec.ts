import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AportacionCotizacionComponent } from './aportacion-cotizacion.component';

describe('AportacionCotizacionComponent', () => {
  let component: AportacionCotizacionComponent;
  let fixture: ComponentFixture<AportacionCotizacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AportacionCotizacionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AportacionCotizacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
