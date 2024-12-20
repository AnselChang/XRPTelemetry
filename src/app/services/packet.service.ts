import { Injectable } from '@angular/core';
import { WebsocketService } from './websocket.service';
import { Observable, Subject } from 'rxjs';
import { DataPacket, MetadataPacket, Packet, PacketType, StartPacket } from '../models/packet';

@Injectable({
  providedIn: 'root'
})
export class PacketService {

  private packets$ = new Subject<Packet[]>();

  constructor(
    private readonly websocketService: WebsocketService,
  ) {

    // On each new message, decode the packets and emit them
    this.websocketService.onMessage$().subscribe((message) => this.decodePackets(message));
  }

  public onPacket$(): Observable<Packet[]> {
    return this.packets$.asObservable();
  }

  private decodePackets(rawPackets: number[]) {

    const packets: Packet[] = [];

    // Decode packets
    while (rawPackets.length > 0) {
      const packet = this.consumePacket(rawPackets);
      packets.push(packet);
    }
    this.packets$.next(packets);
  }

  private consumePacket(packets: number[]): Packet {

    // Get the first byte of the packet as the opcode
    const opcode = packets.shift();
    if (opcode === undefined) throw new Error("Packet is empty");

    if (opcode < 0 || opcode > 127) throw new Error(`Invalid opcode: ${opcode}`);

    // Decode the packet based on the opcode
    switch (opcode) {
      case 127: return this.handleStartPacket(packets);
      case 126: return this.handleMetadataPacket(packets);
      case 125: return this.handleStopPacket(packets);
      case 124: return this.handleDataPacket(packets);
      default: throw new Error(`Unknown opcode: ${opcode}`);
    }
  }

  // Start packet has no data. Do not consume any bytes.
  private handleStartPacket(packets: number[]): StartPacket {
    return { type: PacketType.START };
  }

  // Stop packet has no data. Do not consume any bytes.
  private handleStopPacket(packets: number[]): Packet {
    return { type: PacketType.STOP };
  }

  // Metadata packet contains a byte for channel index, then a variable-length string to indicate
  // channel name, ending with a null byte.
  private handleMetadataPacket(packets: number[]): MetadataPacket {

    // Get the channel index
    const channelIndex = packets.shift();
    if (channelIndex === undefined) throw new Error("Channel index is undefined");

    // Get the channel name
    let channelName = this.extractString(packets);

    return { type: PacketType.METADATA, channelIndex, channelName };
  }

  // Format is [128 - number of pairs] [timestamp] [channel index] [data] [channel index] [data] ...
  private handleDataPacket(packets: number[]): DataPacket {

    // Get number of pairs by consuming the first byte
    const numPairs = 128 - packets.shift()!;

    // Get the timestamp by consuming 4 bytes, modifying the packets array
    const timestamp = parseInt(this.extractString(packets));

    const dataDict: { [channelIndex: number]: number | string } = {};
    for (let i = 0; i < numPairs; i++) {

      // Get the channel index
      const channelIndex = packets.shift();
      if (channelIndex === undefined) throw new Error("Channel index is undefined");

      // Get the null-terminated data string
      let data: number | string = this.extractString(packets);

      // Convert the string to a number if possible
      if (!isNaN(parseFloat(data))) data = parseFloat(data);

      // Map the channel index to the data for it
      dataDict[channelIndex] = data
    }
    
    return { type: PacketType.DATA, timestamp, dataDict };
  }

  private extractString(packets: number[]): string {
    let byte = packets.shift();
    if (byte === undefined) throw new Error("String is empty");

    let str = "";
    while (byte !== 0) {
      str += String.fromCharCode(byte);
      byte = packets.shift();
      if (byte === undefined) throw new Error("String is not null-terminated");
    }
    return str;
  }

}