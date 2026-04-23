import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Relatorioepi } from './relatorioepi';


describe('Relatorioepi', () => {
  let component: Relatorioepi;
  let fixture: ComponentFixture<Relatorioepi>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Relatorioepi]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Relatorioepi);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
