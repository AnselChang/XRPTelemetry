import { Injectable } from '@angular/core';
import { TelemetryData } from '../models/telemetry-data';
import { PacketService } from './packet.service';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataPacket, MetadataPacket, PacketType } from '../models/packet';

export enum TelemetryState {
  NOT_STARTED = "NOT_STARTED",
  SENDING = "SENDING",
  STOPPED = "STOPPED",
}

@Injectable({
  providedIn: 'root'
})
export class TelemetryDataService {

  private data: TelemetryData = new TelemetryData();
  private state$ = new BehaviorSubject<TelemetryState>(TelemetryState.NOT_STARTED);

  private data$ = new BehaviorSubject<TelemetryData>(new TelemetryData());

  constructor(
    private readonly packetService: PacketService,
  ) {
    // On each new message, decode the packets and emit them
    this.packetService.onPacket$().subscribe((packets) => {

      // Handle each packet
      for (let packet of packets) {

        switch (packet.type) {

          case PacketType.START:
            this.data.reset();
            this.data$.next(this.data.copy());
            this.state$.next(TelemetryState.SENDING);
            break;
          
          case PacketType.METADATA:
            const metadata = packet as MetadataPacket;
            this.data.addChannel(metadata.channelIndex, metadata.channelName);
            break;

          case PacketType.DATA:
            const data = packet as DataPacket;
            this.data.addDataForChannel(data.channelIndex, data.timestamp, data.data);
            break;

          case PacketType.STOP:
            this.state$.next(TelemetryState.STOPPED);
            break;
        }
      }

      // Notify the new data
      this.data$.next(this.data.copy());
    });
  }

  public onState$(): Observable<TelemetryState> {
    return this.state$.asObservable();
  }

  public getState(): TelemetryState {
    return this.state$.getValue();
  }

  // Get the current telemetry data
  public getData(): TelemetryData {
    return this.data;
  }

  // Get reactive data. Notifies every time the UPDATE_UI packet is received
  public onData$(): Observable<TelemetryData> {
    return this.data$.asObservable();
  }

}
