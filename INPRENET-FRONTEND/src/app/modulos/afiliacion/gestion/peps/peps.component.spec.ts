import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PepsComponent } from './peps.component';

describe('PepsComponent', () => {
  let component: PepsComponent;
  let fixture: ComponentFixture<PepsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PepsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PepsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
