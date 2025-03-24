import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicMenuConstanciasComponent } from './dynamic-menu-constancias.component';

describe('DynamicMenuConstanciasComponent', () => {
  let component: DynamicMenuConstanciasComponent;
  let fixture: ComponentFixture<DynamicMenuConstanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicMenuConstanciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicMenuConstanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
