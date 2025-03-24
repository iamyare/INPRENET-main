import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogSuboptionsComponent } from './dialog-suboptions.component';

describe('DialogSuboptionsComponent', () => {
  let component: DialogSuboptionsComponent;
  let fixture: ComponentFixture<DialogSuboptionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogSuboptionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogSuboptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
