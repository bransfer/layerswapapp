import bs58 from 'bs58';
import { Address, hexlify } from 'fuels';
import {
  EthereumFakeAccount,
  type FakeAccount,
  SolanaFakeAccount,
} from './FakeAccount';
import type { Hash, Option } from './types';

export interface PredicateWalletAdapter {
  convertAddress: (address: string) => string;
  generateFakeAccount: () => FakeAccount;
  buildWitnessData: (
    account: FakeAccount,
    signature: Option<string, Uint8Array, Hash>,
  ) => Array<Option<string, Uint8Array, Hash>>;
}

export class EthereumWalletAdapter implements PredicateWalletAdapter {
  convertAddress = (address: string): string => {
    return Address.fromEvmAddress(address).toString();
  };

  generateFakeAccount = (): FakeAccount => {
    return new EthereumFakeAccount();
  };

  buildWitnessData = (
    _account: FakeAccount,
    signature: Option<string, Uint8Array, Hash>,
  ): Array<Option<string, Uint8Array, Hash>> => {
    return [signature];
  };
}

export class SolanaWalletAdapter implements PredicateWalletAdapter {
  convertAddress = (address: string): string => {
    return hexlify(bs58.decode(address));
  };

  generateFakeAccount = (): FakeAccount => {
    return new SolanaFakeAccount();
  };

  buildWitnessData = (
    _account: FakeAccount,
    signature: Option<string, Uint8Array, Hash>,
  ): Array<Option<string, Uint8Array, Hash>> => {
    return [signature];
  };
}