import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerplancerradaComponent } from './verplancerrada.component';

describe('VerplancerradaComponent', () => {
  let component: VerplancerradaComponent;
  let fixture: ComponentFixture<VerplancerradaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VerplancerradaComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(VerplancerradaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
