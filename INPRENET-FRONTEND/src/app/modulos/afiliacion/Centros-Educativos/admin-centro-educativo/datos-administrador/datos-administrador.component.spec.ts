import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatosAdministradorComponent } from './datos-administrador.component';

describe('DatosAdministradorComponent', () => {
  let component: DatosAdministradorComponent;
  let fixture: ComponentFixture<DatosAdministradorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatosAdministradorComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatosAdministradorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
