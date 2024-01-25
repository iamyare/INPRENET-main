import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoBeneficioComponent } from './nuevo-beneficio.component';

describe('NuevoBeneficioComponent', () => {
  let component: NuevoBeneficioComponent;
  let fixture: ComponentFixture<NuevoBeneficioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoBeneficioComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoBeneficioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
