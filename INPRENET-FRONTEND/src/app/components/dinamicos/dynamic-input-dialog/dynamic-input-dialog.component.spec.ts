import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicInputDialogComponent } from './dynamic-input-dialog.component';

describe('DynamicInputDialogComponent', () => {
  let component: DynamicInputDialogComponent;
  let fixture: ComponentFixture<DynamicInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicInputDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
