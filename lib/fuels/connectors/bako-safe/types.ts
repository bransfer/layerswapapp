import type { StorageAbstract, TransactionRequestLike } from 'fuels';
import type { BakoSafeConnector } from './BakoSafeConnector';
import type { RequestAPI } from './request';

export enum BakoSafeConnectorEvents {
  //default
  DEFAULT = 'message',

  //client
  CLIENT_DISCONNECTED = '[CLIENT_DISCONNECTED]',
  CLIENT_CONNECTED = '[CONNECTED]',

  //transactions
  TX_PENDING = '[TX_EVENT_REQUESTED]',
  TX_CONFIRMED = '[TX_EVENT_CONFIRMED]',
  TX_TIMEOUT = '[TX_EVENT_TIMEOUT]',

  //auth
  AUTH_CONFIRMED = '[AUTH_CONFIRMED]',
}

export enum BakoSafeUsernames {
  CONNECTOR = '[CONNECTOR]',
  CLIENT = '[UI]',
  SERVER = '[API]',
}

export type BakoSafeConnectorConfig = {
  host?: string;
  appUrl?: string;
  storage?: StorageAbstract;
  api?: RequestAPI;
};

export interface ISocketAuth {
  username: string;
  data: Date;
  origin: string;
  sessionId: string;
}

export interface ISocketMessage<T> {
  username: BakoSafeUsernames;
  room: string;
  to: BakoSafeUsernames;
  type: BakoSafeConnectorEvents;
  data: T;
}

export interface ICreateClientSocket {
  sessionId: string;
  events: BakoSafeConnector;
}

export interface IRequestTxPending {
  _transaction: TransactionRequestLike;
  _address: string;
}

export interface IResponseTxCofirmed {
  id: string;
}

export interface IResponseAuthConfirmed {
  connected: boolean;
}