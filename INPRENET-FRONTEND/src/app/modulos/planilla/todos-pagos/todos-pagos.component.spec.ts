import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TodosPagosComponent } from './todos-pagos.component';

describe('TodosPagosComponent', () => {
  let component: TodosPagosComponent;
  let fixture: ComponentFixture<TodosPagosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TodosPagosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TodosPagosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
