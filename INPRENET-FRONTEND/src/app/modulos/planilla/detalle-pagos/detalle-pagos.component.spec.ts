import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallePagosComponent } from './detalle-pagos.component';

describe('DetallePagosComponent', () => {
  let component: DetallePagosComponent;
  let fixture: ComponentFixture<DetallePagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallePagosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DetallePagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
