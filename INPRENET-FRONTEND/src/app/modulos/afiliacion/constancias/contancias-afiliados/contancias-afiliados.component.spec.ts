import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContanciasAfiliadosComponent } from './contancias-afiliados.component';

describe('ContanciasAfiliadosComponent', () => {
  let component: ContanciasAfiliadosComponent;
  let fixture: ComponentFixture<ContanciasAfiliadosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContanciasAfiliadosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ContanciasAfiliadosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
