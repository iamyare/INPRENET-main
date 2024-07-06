import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DatGeneralesAfiliadoComponent } from './dat-generales-afiliado.component';

describe('DatGeneralesAfiliadoComponent', () => {
  let component: DatGeneralesAfiliadoComponent;
  let fixture: ComponentFixture<DatGeneralesAfiliadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatGeneralesAfiliadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DatGeneralesAfiliadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
