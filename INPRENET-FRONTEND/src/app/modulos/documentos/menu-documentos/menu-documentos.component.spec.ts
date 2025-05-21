import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuDocumentosComponent } from './menu-documentos.component';

describe('MenuDocumentosComponent', () => {
  let component: MenuDocumentosComponent;
  let fixture: ComponentFixture<MenuDocumentosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MenuDocumentosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(MenuDocumentosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
