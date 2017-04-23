import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DoctorPortalComponent } from './doctor-portal.component';

describe('DoctorPortalComponent', () => {
  let component: DoctorPortalComponent;
  let fixture: ComponentFixture<DoctorPortalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DoctorPortalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DoctorPortalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
