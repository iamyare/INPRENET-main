import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NuevoTipoPlanillaComponent } from './nuevo-tipo-planilla.component';

describe('NuevoTipoPlanillaComponent', () => {
  let component: NuevoTipoPlanillaComponent;
  let fixture: ComponentFixture<NuevoTipoPlanillaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NuevoTipoPlanillaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NuevoTipoPlanillaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
