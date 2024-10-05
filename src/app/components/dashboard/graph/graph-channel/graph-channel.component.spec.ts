import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphChannelComponent } from './graph-channel.component';

describe('GraphChannelComponent', () => {
  let component: GraphChannelComponent;
  let fixture: ComponentFixture<GraphChannelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GraphChannelComponent]
    });
    fixture = TestBed.createComponent(GraphChannelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
