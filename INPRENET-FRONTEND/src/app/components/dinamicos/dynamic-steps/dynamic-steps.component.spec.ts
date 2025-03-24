import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicStepsComponent } from './dynamic-steps.component';

describe('DynamicStepsComponent', () => {
  let component: DynamicStepsComponent;
  let fixture: ComponentFixture<DynamicStepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicStepsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicStepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
