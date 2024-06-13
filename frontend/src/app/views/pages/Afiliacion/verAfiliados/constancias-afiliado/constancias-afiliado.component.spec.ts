import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstanciasAfiliadoComponent } from './constancias-afiliado.component';

describe('ConstanciasAfiliadoComponent', () => {
  let component: ConstanciasAfiliadoComponent;
  let fixture: ComponentFixture<ConstanciasAfiliadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConstanciasAfiliadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConstanciasAfiliadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
