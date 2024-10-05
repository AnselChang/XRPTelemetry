export interface TelemetryChannel {
    index: number;
    name: string;
    data: { timestamp: number, value: number | string }[];
}

export class TelemetryData {

    private channels: TelemetryChannel[] = [];

    public addChannel(index: number, name: string): void {
        this.channels.push({ index, name, data: [] });
    }

    public addDataForChannel(channelIndex: number, timestamp: number, value: number | string): void {
        const channel = this.channels.find(c => c.index === channelIndex);
        if (!channel) throw new Error(`Channel ${channelIndex} not found`);
        channel.data.push({ timestamp, value });
    }

    public getChannelNames(): string[] {
        return this.channels.map(c => c.name);
    }

    public getAllDataForChannel(channelName: string): { timestamp: number, value: number | string }[] {
        const channel = this.channels.find(c => c.name === channelName);
        if (!channel) throw new Error(`Channel ${channelName} not found`);
        return channel.data;
    }

    // Get the data point at or before the given timestamp
    public getDataAtTimestampForChannel(channelName: string, timestamp: number): number | string | undefined {
        const channel = this.channels.find(c => c.name === channelName);
        if (!channel) throw new Error(`Channel ${channelName} not found`);

        const data = channel.data;
        if (data.length === 0) return undefined;

        // Find the data point at or before the given timestamp
        let i = 0;
        while (i < data.length && data[i].timestamp <= timestamp) {
            i++;
        }

        if (i === 0) return undefined;
        return data[i - 1].value;
    }

    public clearChannels(): void {
        this.channels = [];
    }

}