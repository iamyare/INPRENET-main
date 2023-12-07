import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentroTrabajoComponent } from './centro-trabajo.component';

describe('CentroTrabajoComponent', () => {
  let component: CentroTrabajoComponent;
  let fixture: ComponentFixture<CentroTrabajoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CentroTrabajoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CentroTrabajoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
