import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoBeneficioAfilComponent } from './nuevo-beneficio-afil.component';

describe('NuevoBeneficioAfilComponent', () => {
  let component: NuevoBeneficioAfilComponent;
  let fixture: ComponentFixture<NuevoBeneficioAfilComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoBeneficioAfilComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoBeneficioAfilComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
