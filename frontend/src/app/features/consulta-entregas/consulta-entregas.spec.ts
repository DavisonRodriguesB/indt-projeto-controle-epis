import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultaEntregas } from './consulta-entregas';

describe('ConsultaEntregas', () => {
  let component: ConsultaEntregas;
  let fixture: ComponentFixture<ConsultaEntregas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultaEntregas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultaEntregas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
