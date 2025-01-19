import { Keypair } from '@solana/web3.js';
import nacl from 'tweetnacl';
import { type PrivateKeyAccount, privateKeyToAccount } from 'viem/accounts';
import type { Hash, Option } from './types';

export interface FakeAccount {
  generate: () => void;
  getAddress: () => Option<string, Hash>;
  getRawAddress: () => Uint8Array;
  signMessage: (
    message: Option<string, Uint8Array, Hash>,
  ) => Promise<Option<string, Uint8Array, Hash>>;
}

export class EthereumFakeAccount implements FakeAccount {
  private account!: PrivateKeyAccount;
  constructor() {
    this.generate();
  }

  generate = (): void => {
    this.account = privateKeyToAccount(
      '0x0000000000000000000000000000000000000000000000000000000000000001',
    );
  };

  getAddress = (): Option<string, Hash> => this.account.address;
  getRawAddress = (): Uint8Array =>
    Buffer.from(this.account.address.slice(2), 'hex');

  signMessage = (
    message: Option<string, Uint8Array, Hash>,
  ): Promise<Option<string, Uint8Array, Hash>> => {
    return this.account.signMessage({
      message: message as string,
    });
  };
}

export class SolanaFakeAccount implements FakeAccount {
  private keypair!: Keypair;
  constructor() {
    this.generate();
  }

  generate = (): void => {
    this.keypair = Keypair.generate();
  };

  getAddress = (): Option<string, Hash> => this.keypair.publicKey.toString();
  getRawAddress = (): Uint8Array => this.keypair.publicKey.toBytes();

  private getSmallTxId = (
    message: Option<string, Uint8Array, Hash>,
  ): Uint8Array => {
    const txIdNo0x = message.slice(2);
    const idBytes = `${txIdNo0x.slice(0, 16)}${txIdNo0x.slice(-16)}`;
    return new TextEncoder().encode(idBytes);
  };

  signMessage = (
    message: Option<string, Uint8Array, Hash>,
  ): Promise<Option<string, Uint8Array, Hash>> => {
    return Promise.resolve(
      nacl.sign.detached(this.getSmallTxId(message), this.keypair.secretKey),
    );
  };
}