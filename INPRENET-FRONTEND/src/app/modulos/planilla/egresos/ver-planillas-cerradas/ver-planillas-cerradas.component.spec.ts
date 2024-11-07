import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPlanillasCerradasComponent } from './ver-planillas-cerradas.component';

describe('VerPlanillasCerradasComponent', () => {
  let component: VerPlanillasCerradasComponent;
  let fixture: ComponentFixture<VerPlanillasCerradasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPlanillasCerradasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerPlanillasCerradasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
