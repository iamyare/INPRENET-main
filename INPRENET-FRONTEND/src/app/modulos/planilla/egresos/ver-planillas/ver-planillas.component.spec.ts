import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPlanillasComponent } from './ver-planillas.component';

describe('VerPlanillasComponent', () => {
  let component: VerPlanillasComponent;
  let fixture: ComponentFixture<VerPlanillasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPlanillasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerPlanillasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
