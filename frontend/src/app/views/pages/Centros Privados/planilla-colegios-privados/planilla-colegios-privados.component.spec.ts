import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanillaColegiosPrivadosComponent } from './planilla-colegios-privados.component';

describe('PlanillaColegiosPrivadosComponent', () => {
  let component: PlanillaColegiosPrivadosComponent;
  let fixture: ComponentFixture<PlanillaColegiosPrivadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlanillaColegiosPrivadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlanillaColegiosPrivadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
