import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePlanillaDialogComponent } from './detalle-planilla-dialog.component';

describe('DetallePlanillaDialogComponent', () => {
  let component: DetallePlanillaDialogComponent;
  let fixture: ComponentFixture<DetallePlanillaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePlanillaDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetallePlanillaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
