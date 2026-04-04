import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCategoria } from './modal-categoria';

describe('ModalCategoria', () => {
  let component: ModalCategoria;
  let fixture: ComponentFixture<ModalCategoria>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCategoria]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCategoria);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
