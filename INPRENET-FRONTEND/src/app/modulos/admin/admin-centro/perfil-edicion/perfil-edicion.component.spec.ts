import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PerfilEdicionComponent } from './perfil-edicion.component';

describe('PerfilEdicionComponent', () => {
  let component: PerfilEdicionComponent;
  let fixture: ComponentFixture<PerfilEdicionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PerfilEdicionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PerfilEdicionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
