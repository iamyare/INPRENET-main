import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuContanciasComponent } from './menu-contancias.component';

describe('MenuContanciasComponent', () => {
  let component: MenuContanciasComponent;
  let fixture: ComponentFixture<MenuContanciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuContanciasComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuContanciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
