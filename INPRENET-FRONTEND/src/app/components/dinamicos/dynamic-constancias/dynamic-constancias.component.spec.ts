import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicConstanciasComponent } from './dynamic-constancias.component';

describe('DynamicConstanciasComponent', () => {
  let component: DynamicConstanciasComponent;
  let fixture: ComponentFixture<DynamicConstanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicConstanciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicConstanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
