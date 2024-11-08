import { ComponentFixture, TestBed } from '@angular/core/testing';

import { P60RentasComponent } from './p-60-rentas.component';

describe('P60RentasComponent', () => {
  let component: P60RentasComponent;
  let fixture: ComponentFixture<P60RentasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [P60RentasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(P60RentasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
