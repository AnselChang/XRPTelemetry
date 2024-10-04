import { Component } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { TelemetryService } from './services/telemetry.service';
import { CharStreamHandler } from './util/char-stream-handler';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'XRPTelemetry2';

  constructor(
    private telemetryService: TelemetryService,
  ) {
  }

}
