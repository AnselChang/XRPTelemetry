import { Subject } from 'rxjs';
import { filter, bufferCount, map, concatMap } from 'rxjs/operators';
import { asciiToUint } from './convert';

/**
 * CharStreamHandler is a class that processes a stream of ASCII character codes
 * and detects specific sequences of characters following an escape (ESC) character (ASCII code 27).
 * 
 * The sequence detection process follows these steps:
 * 1. The stream listens for the ESC character (27) as a starting trigger.
 * 2. After detecting ESC, it buffers the next 4 characters from the stream.
 * 3. These 4 characters are converted into an unsigned integer value (using `asciiToUint`), 
 *    which determines how many subsequent characters will form the next sequence.
 * 4. The stream then buffers the exact number of characters specified by the converted count.
 * 5. Once the full sequence is detected, the class emits the sequence through a `valueSequence` subject,
 *    allowing subscribers to process it.
 */

export class CharStreamHandler {
  private charStream = new Subject<number>();
  private valueSequence = new Subject<number[]>();

  constructor() {
    this.setupSequenceHandler();
  }

  private setupSequenceHandler() {
    this.charStream.pipe(
      // Step 1: Look for the ESC character (27)
      filter(char => char === 27),

      // Step 2: After finding ESC, buffer the next 4 characters
      concatMap(() => this.charStream.pipe(bufferCount(4))),

      // Step 3: Convert the 4-character buffer into an unsigned integer (count)
      map(asciiToUint),

      // Step 4: Buffer the exact number of characters as specified by 'count'
      concatMap(count => this.charStream.pipe(bufferCount(count)))
    )
    // Step 5: Process the buffered sequence
    .subscribe(this.handleValueSequence.bind(this));
  }

  private handleValueSequence(sequence: number[]) {
    this.valueSequence.next(sequence);
  }

  public addChar(char: number) {
    this.charStream.next(char);
  }

  public onValueSequence(callback: (values: number[]) => void): void {
    this.valueSequence.subscribe(callback);
  }
}
