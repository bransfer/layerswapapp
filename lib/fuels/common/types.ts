import type EventEmitter from 'node:events';
import type {
  BytesLike,
  Predicate as FuelPredicate,
  Provider as FuelProvider,
  InputValue,
  JsonAbi,
  TransactionRequest,
} from 'fuels';

export type Maybe<T> = T | undefined | null;
export type Option<T1, T2, T3 = string> = T1 | T2 | T3;
export type Hash = `0x${string}`;
export type MaybeAsync<T> = Promise<T> | T;

export interface PredicateConfig {
  abi: JsonAbi;
  bin: BytesLike;
}

export interface PredicateVersion {
  predicate: PredicateConfig;
  generatedAt: number;
}

export interface EIP1193Provider extends EventEmitter {
  request(args: {
    method: string;
    params?: unknown[];
  }): Promise<unknown | unknown[]>;
}

export type ConnectorConfig = {
  [key: string]: unknown;
  predicateConfig?: PredicateConfig;
};

export type ProviderDictionary = {
  fuelProvider: FuelProvider;
  ethProvider?: EIP1193Provider;
  [key: string]: Maybe<Option<FuelProvider, EIP1193Provider>>;
};

export type PreparedTransaction = {
  predicate: FuelPredicate<InputValue[]>;
  request: TransactionRequest;
  transactionId: string;
  account: string;
  transactionRequest: TransactionRequest;
};

export type SignedMessageCustomCurve = {
  curve: string;
  signature: string;
};