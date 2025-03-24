import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilEdicionSeguridadComponent } from './perfil-edicion-seguridad.component';

describe('PerfilEdicionSeguridadComponent', () => {
  let component: PerfilEdicionSeguridadComponent;
  let fixture: ComponentFixture<PerfilEdicionSeguridadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEdicionSeguridadComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerfilEdicionSeguridadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
