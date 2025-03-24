import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliadoComponent } from './afiliado.component';

describe('AfiliadoComponent', () => {
  let component: AfiliadoComponent;
  let fixture: ComponentFixture<AfiliadoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfiliadoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliadoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
