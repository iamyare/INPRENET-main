import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ColMagisterialesComponent } from './col-magisteriales.component';

describe('ColMagisterialesComponent', () => {
  let component: ColMagisterialesComponent;
  let fixture: ComponentFixture<ColMagisterialesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ColMagisterialesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ColMagisterialesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
