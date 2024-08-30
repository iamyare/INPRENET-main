import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarOtrasFuentesIngresoComponent } from './agregar-otras-fuentes-ingreso.component';

describe('AgregarOtrasFuentesIngresoComponent', () => {
  let component: AgregarOtrasFuentesIngresoComponent;
  let fixture: ComponentFixture<AgregarOtrasFuentesIngresoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgregarOtrasFuentesIngresoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgregarOtrasFuentesIngresoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
