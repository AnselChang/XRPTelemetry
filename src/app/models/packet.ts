export enum PacketType {
  START = "START",
  METADATA = "METADATA",
  DATA = "DATA",
  STOP = "STOP",
};

export interface Packet {
  type: PacketType;
}

export interface StartPacket extends Packet {
  type: PacketType.START;
}

export interface MetadataPacket extends Packet {
  type: PacketType.METADATA;
  channelIndex: number;
  channelName: string;
}

export interface DataPacket extends Packet {
  type: PacketType.DATA;
  timestamp: number; // in milliseconds
  dataDict: { [channelIndex: number]: number | string };
}

export interface StopPacket extends Packet {
  type: PacketType.STOP;
}