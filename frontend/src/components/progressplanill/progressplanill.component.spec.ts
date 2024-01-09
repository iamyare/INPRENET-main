import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressplanillComponent } from './progressplanill.component';

describe('ProgressplanillComponent', () => {
  let component: ProgressplanillComponent;
  let fixture: ComponentFixture<ProgressplanillComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressplanillComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgressplanillComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
