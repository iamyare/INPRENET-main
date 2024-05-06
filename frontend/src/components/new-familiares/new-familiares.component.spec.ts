import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewFamiliaresComponent } from './new-familiares.component';

describe('NewFamiliaresComponent', () => {
  let component: NewFamiliaresComponent;
  let fixture: ComponentFixture<NewFamiliaresComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewFamiliaresComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewFamiliaresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
