import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroConsulta } from './filtro-consulta';

describe('FiltroConsulta', () => {
  let component: FiltroConsulta;
  let fixture: ComponentFixture<FiltroConsulta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroConsulta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroConsulta);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
