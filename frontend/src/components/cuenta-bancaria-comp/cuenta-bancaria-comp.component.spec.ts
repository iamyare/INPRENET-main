import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentaBancariaCompComponent } from './cuenta-bancaria-comp.component';

describe('CuentaBancariaCompComponent', () => {
  let component: CuentaBancariaCompComponent;
  let fixture: ComponentFixture<CuentaBancariaCompComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentaBancariaCompComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CuentaBancariaCompComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
