import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AldeaComponent } from './aldea.component';

describe('AldeaComponent', () => {
  let component: AldeaComponent;
  let fixture: ComponentFixture<AldeaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AldeaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AldeaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
