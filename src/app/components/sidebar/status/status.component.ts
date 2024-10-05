import { ChangeDetectionStrategy, Component } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TelemetryDataService, TelemetryState } from 'src/app/services/telemetry-data.service';
import { WebsocketService, WebsocketState } from 'src/app/services/websocket.service';

@Component({
  selector: 'app-status',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusComponent {

  public status$ = new BehaviorSubject<string>('');
  public color$ = new BehaviorSubject<string>('');

  constructor(
    private websocket: WebsocketService,
    private telemetryData: TelemetryDataService
  ) {

    this.updateStatus();

    // On changes to either websocket or telemetry data state, update the status
    this.websocket.onState$().subscribe(() => this.updateStatus());
    this.telemetryData.onState$().subscribe(() => this.updateStatus());

  }

  private updateStatus() {
    const websocketState = this.websocket.getState();
    const telemetryDataState = this.telemetryData.getState();

    let status, color;
    if (websocketState === WebsocketState.DISCONNECTED) {
      status = 'Disconnected';
      color = '#EB3A3A';
    } else {
      switch (telemetryDataState) {
        case TelemetryState.NOT_STARTED:
          status = 'Awaiting telemetry...';
          color = '#EB783A';
          break;
        case TelemetryState.SENDING:
          status = 'Collecting telemetry';
          color = '#EBBC3A';
          break;
        case TelemetryState.STOPPED:
          status = 'Telemetry collected';
          color = '#3AEB75';
          break;
      }
    }

    this.status$.next(status);
    this.color$.next(color);
  }

}
