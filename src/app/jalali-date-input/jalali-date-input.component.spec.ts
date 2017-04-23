import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JalaliDateInputComponent } from './jalali-date-input.component';

describe('JalaliDateInputComponent', () => {
  let component: JalaliDateInputComponent;
  let fixture: ComponentFixture<JalaliDateInputComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JalaliDateInputComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JalaliDateInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
