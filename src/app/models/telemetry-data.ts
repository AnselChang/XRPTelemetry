import { ChartColor } from "../util/chart-color";

export interface TelemetryChannel {
    index: number;
    name: string;
    color: ChartColor;
    data: { timestamp: number, value: number | string }[];
    minValue: number,
    maxValue: number
}

export class TelemetryData {

    private channels!: TelemetryChannel[];
    private latestTimestamp!: number;
    constructor() {
        this.reset();
    }

    public reset(): void {
        this.channels = [];
        this.latestTimestamp = 0;
    }

    public addChannel(index: number, name: string): void {

        // Chart color is modulo of the index
        const color = Object.values(ChartColor)[index % Object.values(ChartColor).length];

        this.channels.push({ index, name, color, data: [], minValue: Infinity, maxValue: -Infinity });
    }

    public addDataForChannel(channelIndex: number, timestamp: number, value: number | string): void {
        const channel = this.channels.find(c => c.index === channelIndex);
        if (!channel) throw new Error(`Channel ${channelIndex} not found`);
        channel.data.push({ timestamp, value });

        // Update latest timestamp
        if (timestamp > this.latestTimestamp) this.latestTimestamp = timestamp;

        // Update min/max Y values
        if (typeof value === 'number') {
            if (value < channel.minValue) channel.minValue = value;
            if (value > channel.maxValue) channel.maxValue = value;
        }
    }

    public getChannelNames(): string[] {
        return this.channels.map(c => c.name);
    }

    public getAllDataForChannel(channelName: string): { timestamp: number, value: number | string }[] {
        const channel = this.channels.find(c => c.name === channelName);
        if (!channel) throw new Error(`Channel ${channelName} not found`);
        return channel.data;
    }

    public getChannelColor(channelName: string): ChartColor {
        const channel = this.channels.find(c => c.name === channelName);
        if (!channel) throw new Error(`Channel ${channelName} not found`);
        return channel.color;
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

    public getLatestTimestamp(): number {
        return this.latestTimestamp;
    }

    // Get the min y values for the given channels. If channels not provided, find global min y
    public getMinY(channels: string[] | null = null): number {
        if (channels === null) channels = this.getChannelNames();

        let min = Infinity;
        for (const channel of channels) {
            const minValue = this.channels.find(c => c.name === channel)!.minValue;
            min = Math.min(min, minValue);
        }
        return min;

    }

    // Get the max y values for the given channels. If channels not provided, find global max y
    public getMaxY(channels: string[] | null = null): number {
        if (channels === null) channels = this.getChannelNames();


        let max = -Infinity;
        for (const channel of channels) {
            const maxValue = this.channels.find(c => c.name === channel)!.maxValue;
            max = Math.max(max, maxValue);
        }

        return max;
    }

    public copy(): TelemetryData {
        const copy = new TelemetryData();
        copy.channels = this.channels.map(c => ({ ...c, data: [...c.data] }));
        copy.latestTimestamp = this.latestTimestamp;
        return copy;
    }

}