import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SidebarTabComponent } from './sidebar-tab.component';

describe('SidebarTabComponent', () => {
  let component: SidebarTabComponent;
  let fixture: ComponentFixture<SidebarTabComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SidebarTabComponent]
    });
    fixture = TestBed.createComponent(SidebarTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
