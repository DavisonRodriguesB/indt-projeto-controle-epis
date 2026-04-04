import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalEntradaSaldo } from './modal-entrada-saldo';

describe('ModalEntradaSaldo', () => {
  let component: ModalEntradaSaldo;
  let fixture: ComponentFixture<ModalEntradaSaldo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalEntradaSaldo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalEntradaSaldo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
