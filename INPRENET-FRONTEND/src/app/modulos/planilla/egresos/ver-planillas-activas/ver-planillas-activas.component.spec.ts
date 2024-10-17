import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerPlanillasActivasComponent } from './ver-planillas-activas.component';

describe('VerPlanillasActivasComponent', () => {
  let component: VerPlanillasActivasComponent;
  let fixture: ComponentFixture<VerPlanillasActivasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerPlanillasActivasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerPlanillasActivasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
