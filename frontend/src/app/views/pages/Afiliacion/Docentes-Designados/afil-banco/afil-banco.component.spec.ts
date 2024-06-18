import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfilBancoComponent } from './afil-banco.component';

describe('AfilBancoComponent', () => {
  let component: AfilBancoComponent;
  let fixture: ComponentFixture<AfilBancoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfilBancoComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfilBancoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
