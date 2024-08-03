import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DialogDesgloseComponent } from './dialog-desglose.component';

describe('DialogDesgloseComponent', () => {
  let component: DialogDesgloseComponent;
  let fixture: ComponentFixture<DialogDesgloseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DialogDesgloseComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DialogDesgloseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
