import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorVisitsComponent } from './doctor-visits.component';

describe('DoctorVisitsComponent', () => {
  let component: DoctorVisitsComponent;
  let fixture: ComponentFixture<DoctorVisitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorVisitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorVisitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
