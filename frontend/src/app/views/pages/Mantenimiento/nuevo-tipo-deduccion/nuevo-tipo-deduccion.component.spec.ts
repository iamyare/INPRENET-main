import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoTipoDeduccionComponent } from './nuevo-tipo-deduccion.component';

describe('NuevoTipoDeduccionComponent', () => {
  let component: NuevoTipoDeduccionComponent;
  let fixture: ComponentFixture<NuevoTipoDeduccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoTipoDeduccionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoTipoDeduccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
