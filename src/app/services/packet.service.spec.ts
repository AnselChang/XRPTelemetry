import { TestBed } from '@angular/core/testing';

import { PacketService } from './packet.service';

describe('TelemetryService', () => {
  let service: PacketService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PacketService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
