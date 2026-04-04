import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSetor } from './modal-setor';

describe('ModalSetor', () => {
  let component: ModalSetor;
  let fixture: ComponentFixture<ModalSetor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalSetor]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalSetor);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
