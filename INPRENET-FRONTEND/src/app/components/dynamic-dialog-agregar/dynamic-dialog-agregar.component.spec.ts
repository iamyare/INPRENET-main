import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicDialogAgregarComponent } from './dynamic-dialog-agregar.component';

describe('DynamicDialogAgregarComponent', () => {
  let component: DynamicDialogAgregarComponent;
  let fixture: ComponentFixture<DynamicDialogAgregarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicDialogAgregarComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicDialogAgregarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
