import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReferenciasBancariasComercialesComponent } from './referencias-bancarias-comerciales.component';

describe('ReferenciasBancariasComercialesComponent', () => {
  let component: ReferenciasBancariasComercialesComponent;
  let fixture: ComponentFixture<ReferenciasBancariasComercialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReferenciasBancariasComercialesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReferenciasBancariasComercialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
