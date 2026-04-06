import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TabelaConsulta } from './tabela-consulta';

describe('TabelaConsulta', () => {
  let component: TabelaConsulta;
  let fixture: ComponentFixture<TabelaConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TabelaConsulta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TabelaConsulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
