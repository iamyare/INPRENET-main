import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BotonarchivosComponent } from './botonarchivos.component';

describe('BotonarchivosComponent', () => {
  let component: BotonarchivosComponent;
  let fixture: ComponentFixture<BotonarchivosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BotonarchivosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BotonarchivosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
