import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressbarDynamicComponent } from './progressbar-dynamic.component';

describe('ProgressbarDynamicComponent', () => {
  let component: ProgressbarDynamicComponent;
  let fixture: ComponentFixture<ProgressbarDynamicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressbarDynamicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProgressbarDynamicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
