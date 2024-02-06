import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionAfilPlanComponent } from './asignacion-afil-plan.component';

describe('AsignacionAfilPlanComponent', () => {
  let component: AsignacionAfilPlanComponent;
  let fixture: ComponentFixture<AsignacionAfilPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionAfilPlanComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignacionAfilPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
