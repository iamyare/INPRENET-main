import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BenefComponent } from './benef.component';

describe('BenefComponent', () => {
  let component: BenefComponent;
  let fixture: ComponentFixture<BenefComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BenefComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BenefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
