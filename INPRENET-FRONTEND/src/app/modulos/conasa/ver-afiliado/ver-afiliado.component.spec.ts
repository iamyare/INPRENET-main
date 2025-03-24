import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerAfiliadoComponent } from './ver-afiliado.component';

describe('VerAfiliadoComponent', () => {
  let component: VerAfiliadoComponent;
  let fixture: ComponentFixture<VerAfiliadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerAfiliadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerAfiliadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
