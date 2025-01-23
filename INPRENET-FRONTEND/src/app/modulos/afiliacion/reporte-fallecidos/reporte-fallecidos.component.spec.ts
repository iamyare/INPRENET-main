import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteFallecidosComponent } from './reporte-fallecidos.component';

describe('ReporteFallecidosComponent', () => {
  let component: ReporteFallecidosComponent;
  let fixture: ComponentFixture<ReporteFallecidosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReporteFallecidosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReporteFallecidosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
