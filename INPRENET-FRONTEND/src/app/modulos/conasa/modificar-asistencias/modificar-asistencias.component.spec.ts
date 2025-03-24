import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModificarAsistenciasComponent } from './modificar-asistencias.component';

describe('ModificarAsistenciasComponent', () => {
  let component: ModificarAsistenciasComponent;
  let fixture: ComponentFixture<ModificarAsistenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModificarAsistenciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModificarAsistenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
