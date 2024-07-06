import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CausanteDetalleComponent } from './causante-detalle.component';

describe('CausanteDetalleComponent', () => {
  let component: CausanteDetalleComponent;
  let fixture: ComponentFixture<CausanteDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CausanteDetalleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CausanteDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
