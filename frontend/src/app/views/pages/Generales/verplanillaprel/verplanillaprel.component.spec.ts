import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerplanillaprelComponent } from './verplanillaprel.component';

describe('VerplanillaprelComponent', () => {
  let component: VerplanillaprelComponent;
  let fixture: ComponentFixture<VerplanillaprelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerplanillaprelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerplanillaprelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
