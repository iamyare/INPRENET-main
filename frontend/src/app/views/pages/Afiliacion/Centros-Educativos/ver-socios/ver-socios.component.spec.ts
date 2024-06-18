import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerSociosComponent } from './ver-socios.component';

describe('VerSociosComponent', () => {
  let component: VerSociosComponent;
  let fixture: ComponentFixture<VerSociosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerSociosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerSociosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
