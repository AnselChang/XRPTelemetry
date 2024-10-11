// return in format "MM:SS.sss"
export function timestampToString(timestamp: number | null | undefined): string {

    if (timestamp === null || timestamp === undefined) timestamp = 0;

    const minutes = Math.floor(timestamp / 60000);
    const seconds = Math.floor((timestamp % 60000) / 1000);
    const milliseconds = Math.floor(timestamp % 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}