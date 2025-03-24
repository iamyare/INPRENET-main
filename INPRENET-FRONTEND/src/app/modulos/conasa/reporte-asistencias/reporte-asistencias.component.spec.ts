import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteAsistenciasComponent } from './reporte-asistencias.component';

describe('ReporteAsistenciasComponent', () => {
  let component: ReporteAsistenciasComponent;
  let fixture: ComponentFixture<ReporteAsistenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteAsistenciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReporteAsistenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
