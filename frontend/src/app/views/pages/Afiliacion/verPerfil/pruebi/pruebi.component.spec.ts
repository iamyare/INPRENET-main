import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PruebiComponent } from './pruebi.component';

describe('PruebiComponent', () => {
  let component: PruebiComponent;
  let fixture: ComponentFixture<PruebiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PruebiComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PruebiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
