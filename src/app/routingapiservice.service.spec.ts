import { TestBed } from '@angular/core/testing';

import { RoutingapiserviceService } from './routingapiservice.service';

describe('RoutingapiserviceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: RoutingapiserviceService = TestBed.get(RoutingapiserviceService);
    expect(service).toBeTruthy();
  });
});
