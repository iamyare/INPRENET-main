import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerplanprelcompComponent } from './verplanprelcomp.component';

describe('VerplanprelcompComponent', () => {
  let component: VerplanprelcompComponent;
  let fixture: ComponentFixture<VerplanprelcompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerplanprelcompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerplanprelcompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
