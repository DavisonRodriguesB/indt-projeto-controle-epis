import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCargo } from './modal-cargo';

describe('ModalCargo', () => {
  let component: ModalCargo;
  let fixture: ComponentFixture<ModalCargo>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalCargo]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCargo);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
