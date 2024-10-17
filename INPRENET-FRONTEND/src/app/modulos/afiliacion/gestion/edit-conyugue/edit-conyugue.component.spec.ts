import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditConyugueComponent } from './edit-conyugue.component';

describe('EditConyugueComponent', () => {
  let component: EditConyugueComponent;
  let fixture: ComponentFixture<EditConyugueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditConyugueComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditConyugueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
