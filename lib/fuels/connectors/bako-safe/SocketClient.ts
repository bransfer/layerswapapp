import { type Socket, io } from 'socket.io-client';
import type { BakoSafeConnector } from './BakoSafeConnector';
import { APP_URL, SOCKET_URL } from './constants';
import { WINDOW } from './constants';
import {
  BakoSafeConnectorEvents,
  BakoSafeUsernames,
  type ICreateClientSocket,
  type IResponseAuthConfirmed,
  type IResponseTxCofirmed,
  type ISocketAuth,
  type ISocketMessage,
} from './types';

const default_socket_auth: Omit<ISocketAuth, 'sessionId'> = {
  username: BakoSafeUsernames.CONNECTOR,
  data: new Date(),
  origin: WINDOW.origin ?? APP_URL,
};

export class SocketClient {
  server: Socket;
  events: BakoSafeConnector;
  request_id: string;

  constructor({ sessionId, events }: ICreateClientSocket) {
    this.request_id = crypto.randomUUID();

    this.server = io(SOCKET_URL, {
      auth: {
        ...default_socket_auth,
        sessionId,
        request_id: this.request_id,
      },
      autoConnect: false,
      reconnection: false,
    });

    this.events = events;
    this.server?.on(
      BakoSafeConnectorEvents.DEFAULT,
      (data: ISocketMessage<IResponseTxCofirmed | IResponseAuthConfirmed>) => {
        if (data.to === default_socket_auth.username) {
          this.events.emit(data.type, {
            from: data.username,
            data: data.data,
          });
        }
      },
    );

    this.server.connect();
  }

  get isConnected() {
    return this.server.connected;
  }
}