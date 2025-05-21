import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelarAsistenciasComponent } from './cancelar-asistencias.component';

describe('CancelarAsistenciasComponent', () => {
  let component: CancelarAsistenciasComponent;
  let fixture: ComponentFixture<CancelarAsistenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CancelarAsistenciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CancelarAsistenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
