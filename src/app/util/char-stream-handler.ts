import { Subject } from 'rxjs';
import { filter, bufferCount, map, concatMap } from 'rxjs/operators';

/**
 * CharStreamHandler is a class that processes a stream of ASCII character codes
 * and detects specific sequences of characters following an escape (ESC) character (ASCII code 27).
 * 
 * The sequence detection process follows these steps:
 * 1. The stream listens for the ESC character (27) as a starting trigger.
 * 2. After detecting ESC, it buffers the next characters until it finds a null character (0) to get the sequence length.
 * 3. Sequence length is converted to an unsigned integer (count),
 *    which determines how many subsequent characters will form the next sequence.
 * 4. The stream then buffers the exact number of characters specified by the converted count.
 * 5. Once the full sequence is detected, the class emits the sequence through a `valueSequence` subject,
 *    allowing subscribers to process it.
 */

export class CharStreamHandler {
  private buffer: number[] = [];
  private isEscapeMode: boolean = false;
  private sequenceLength: number | null = null;
  private callbacks: ((values: number[]) => void)[] = [];

  public addChar(char: number): void {
    if (!this.isEscapeMode && char === 27) {

      // Step 1: Look for the ESC character (27)
      this.isEscapeMode = true;
      this.buffer = [];

    } else if (this.isEscapeMode && this.sequenceLength === null) {
      
      if (char !== 0) {
        // Step 2: Buffer the next characters until a null character (0) is found
        this.buffer.push(char);
      } else {
        // Step 3: Convert ascii leters into an integer for the sequence length
        this.sequenceLength = parseInt(String.fromCharCode(...this.buffer), 10);
        console.log(`Detected sequence length: ${this.sequenceLength}`);
        this.buffer = [];
      }

    } else if (this.isEscapeMode && this.sequenceLength !== null) {

      // Step 4: Buffer the exact number of characters as specified by 'count'
      this.buffer.push(char);
      if (this.buffer.length === this.sequenceLength) {
        // Step 5: Process the buffered sequence
        this.handleValueSequence(this.buffer);
        this.resetState();
      }

    }
  }

  private resetState(): void {
    this.isEscapeMode = false;
    this.sequenceLength = null;
    this.buffer = [];
  }

  private handleValueSequence(sequence: number[]): void {
    this.callbacks.forEach(callback => callback(sequence));
  }

  public onValueSequence(callback: (values: number[]) => void): void {
    this.callbacks.push(callback);
  }
}
