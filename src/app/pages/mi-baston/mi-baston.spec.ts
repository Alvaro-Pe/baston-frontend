import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiBaston } from './mi-baston';

describe('MiBaston', () => {
  let component: MiBaston;
  let fixture: ComponentFixture<MiBaston>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiBaston],
    }).compileComponents();

    fixture = TestBed.createComponent(MiBaston);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
