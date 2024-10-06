import { ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { TelemetryData } from 'src/app/models/telemetry-data';
import { TelemetryDataService } from 'src/app/services/telemetry-data.service';

@Component({
  selector: 'app-dashboard-page',
  templateUrl: './dashboard-page.component.html',
  styleUrls: ['./dashboard-page.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardPageComponent {

  readonly DEFAULT_DATA = new TelemetryData();

  constructor(
    public telemetryDataService: TelemetryDataService,
  ) {
  }

}
