import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDatosAfiliadosComponent } from './ver-datos-afiliados.component';

describe('VerDatosAfiliadosComponent', () => {
  let component: VerDatosAfiliadosComponent;
  let fixture: ComponentFixture<VerDatosAfiliadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerDatosAfiliadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerDatosAfiliadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
