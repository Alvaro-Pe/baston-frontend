import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Bastones } from './bastones';

describe('Bastones', () => {
  let component: Bastones;
  let fixture: ComponentFixture<Bastones>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Bastones],
    }).compileComponents();

    fixture = TestBed.createComponent(Bastones);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
