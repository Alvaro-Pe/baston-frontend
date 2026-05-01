import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalleBaston } from './detalle-baston';

describe('DetalleBaston', () => {
  let component: DetalleBaston;
  let fixture: ComponentFixture<DetalleBaston>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalleBaston],
    }).compileComponents();

    fixture = TestBed.createComponent(DetalleBaston);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
