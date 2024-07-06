import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableUserDialogComponent } from './disable-user-dialog.component';

describe('DisableUserDialogComponent', () => {
  let component: DisableUserDialogComponent;
  let fixture: ComponentFixture<DisableUserDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DisableUserDialogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DisableUserDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
