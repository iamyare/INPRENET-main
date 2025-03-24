import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerFacturasComponent } from './ver-facturas.component';

describe('VerFacturasComponent', () => {
  let component: VerFacturasComponent;
  let fixture: ComponentFixture<VerFacturasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerFacturasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerFacturasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
