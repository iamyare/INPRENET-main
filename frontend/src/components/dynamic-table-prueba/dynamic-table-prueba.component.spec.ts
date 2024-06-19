import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicTablePruebaComponent } from './dynamic-table-prueba.component';

describe('DynamicTablePruebaComponent', () => {
  let component: DynamicTablePruebaComponent;
  let fixture: ComponentFixture<DynamicTablePruebaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DynamicTablePruebaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DynamicTablePruebaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
