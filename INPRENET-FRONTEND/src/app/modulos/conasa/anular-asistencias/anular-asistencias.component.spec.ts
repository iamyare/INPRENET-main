import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnularAsistenciasComponent } from './anular-asistencias.component';

describe('AnularAsistenciasComponent', () => {
  let component: AnularAsistenciasComponent;
  let fixture: ComponentFixture<AnularAsistenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnularAsistenciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AnularAsistenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
