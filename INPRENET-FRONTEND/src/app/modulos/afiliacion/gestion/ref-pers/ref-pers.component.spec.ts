import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RefPersComponent } from './ref-pers.component';

describe('RefPersComponent', () => {
  let component: RefPersComponent;
  let fixture: ComponentFixture<RefPersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RefPersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RefPersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
