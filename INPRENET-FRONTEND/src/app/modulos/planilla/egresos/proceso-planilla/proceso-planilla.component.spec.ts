import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcesoPlanillaComponent } from './proceso-planilla.component';

describe('ProcesoPlanillaComponent', () => {
  let component: ProcesoPlanillaComponent;
  let fixture: ComponentFixture<ProcesoPlanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcesoPlanillaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcesoPlanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
