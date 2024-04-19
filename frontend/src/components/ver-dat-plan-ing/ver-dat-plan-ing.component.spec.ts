import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerDatPlanIngComponent } from './ver-dat-plan-ing.component';

describe('VerDatPlanIngComponent', () => {
  let component: VerDatPlanIngComponent;
  let fixture: ComponentFixture<VerDatPlanIngComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerDatPlanIngComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerDatPlanIngComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
