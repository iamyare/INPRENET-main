import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarbefDedComponent } from './cargarbef-ded.component';

describe('CargarbefDedComponent', () => {
  let component: CargarbefDedComponent;
  let fixture: ComponentFixture<CargarbefDedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CargarbefDedComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CargarbefDedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
