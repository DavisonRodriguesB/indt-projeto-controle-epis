import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioEntrega } from './formulario-entrega';

describe('FormularioEntrega', () => {
  let component: FormularioEntrega;
  let fixture: ComponentFixture<FormularioEntrega>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioEntrega]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FormularioEntrega);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
