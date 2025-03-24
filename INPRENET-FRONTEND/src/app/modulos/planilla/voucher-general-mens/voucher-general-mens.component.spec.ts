import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VoucherGeneralMensComponent } from './voucher-general-mens.component';

describe('VoucherGeneralMensComponent', () => {
  let component: VoucherGeneralMensComponent;
  let fixture: ComponentFixture<VoucherGeneralMensComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VoucherGeneralMensComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VoucherGeneralMensComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
