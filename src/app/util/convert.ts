
// Convert 4 bytes to a 32-bit unsigned integer
export function asciiToUint(byteArray: number[]): number {

  if (byteArray.length !== 4) throw new Error("Uint must be 4 bytes");

  const value = (byteArray[0] << 24) | (byteArray[1] << 16) | (byteArray[2] << 8) | byteArray[3];
  return value;
}