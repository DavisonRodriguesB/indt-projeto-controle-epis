import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListaResumo } from './lista-resumo';

describe('ListaResumo', () => {
  let component: ListaResumo;
  let fixture: ComponentFixture<ListaResumo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListaResumo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListaResumo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
