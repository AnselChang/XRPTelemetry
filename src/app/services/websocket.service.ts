import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { CharStreamHandler } from '../util/char-stream-handler';

export enum WebsocketState {
  CONNECTED = "CONNECTED",
  DISCONNECTED = "DISCONNECTED",
}

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket?: WebSocket;
  private state$ = new BehaviorSubject<WebsocketState>(WebsocketState.DISCONNECTED);
  private message$ = new Subject<number[]>();

  private readonly encoder = new TextEncoder();
  private readonly streamHandler = new CharStreamHandler();

  constructor() {
    // On each new value sequence, emit it to the messages$ observable
    this.streamHandler.onValueSequence((values) => this.message$.next(values));

    this.connectWebsocket();
  }

  public onMessage$(): Observable<number[]> {
    return this.message$.asObservable();
  }

  public onState$(): Observable<WebsocketState> {
    return this.state$.asObservable();
  }

  public getState(): WebsocketState {
    return this.state$.getValue();
  }

  public connectWebsocket() {
    this.socket = new WebSocket("ws://localhost:6789");

    this.socket.onopen = (event) => {
      console.log("WebSocket connection established.");
      this.state$.next(WebsocketState.CONNECTED);
    };

    this.socket.onmessage = (event) => {
      const bytes = this.encoder.encode(event.data);
      //console.log("WebSocket message received: ", bytes, event.data);
      for (const byte of bytes) this.streamHandler.addChar(byte);
    };

    this.socket.onclose = (event) => {
      if (this.getState() === WebsocketState.CONNECTED) console.log("WebSocket connection closed. Waiting for new connection...");
      this.state$.next(WebsocketState.DISCONNECTED);
      setTimeout(() => this.connectWebsocket(), 500);
    };

    this.socket.onerror = (error) => {
      if (this.getState() === WebsocketState.CONNECTED) console.log("WebSocket error: ", error);
    };
  }
}