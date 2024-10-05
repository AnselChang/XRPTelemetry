import { ChangeDetectionStrategy, Component } from '@angular/core';
import { WebsocketService } from './services/websocket.service';
import { PacketService } from './services/packet.service';
import { CharStreamHandler } from './util/char-stream-handler';
import { TelemetryDataService } from './services/telemetry-data.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
  title = 'XRPTelemetry2';

  constructor(
    private websocketService: WebsocketService,
    private packetService: PacketService,
    private telemetryDataService: TelemetryDataService,
  ) {
  }

}
