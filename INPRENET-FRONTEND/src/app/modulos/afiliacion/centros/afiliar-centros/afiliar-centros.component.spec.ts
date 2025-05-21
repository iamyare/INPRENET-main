import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AfiliarCentrosComponent } from './afiliar-centros.component';

describe('AfiliarCentrosComponent', () => {
  let component: AfiliarCentrosComponent;
  let fixture: ComponentFixture<AfiliarCentrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AfiliarCentrosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AfiliarCentrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
