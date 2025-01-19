import * as Starknet from 'starknet';

type SignatureFormat =
  | 'argent-v0.3.0'
  | 'argent-v0.3.1'
  | 'argent-v0.4.0-starknet-signer'
  | 'argent-v0.4.0-secp256k1-signer'
  | 'argent-v0.4.0-secp256r1-signer'
  | 'argent-v0.4.0-eip191-signer'
  | 'argent-v0.4.0-webauthn-signer'
  | 'argent-multicall'
  | 'argent-multisig-v0.1.0'
  | 'argent-multisig-v0.1.1'
  | 'argent-multisig-v0.2.0'
  | 'braavos-v1.0.0-stark-signer'
  | 'braavos-v1.0.0-strong-signer'
  | 'braavos-v1.0.0-multisig'
  | 'braavos-multi-owner-v1.0.0'
  | 'unknown';

interface CheckResult {
  readonly ok: boolean;
  readonly reason?: string;
}

export class AccountSupport {
  private signatureFormat: SignatureFormat | null = null;

  constructor(
    /** The contract instance of the account. */
    private readonly contract: Starknet.Contract,
    /** The class hash of the account contract. */
    private readonly classHash: string,
  ) {
    this.classHash = Starknet.num.cleanHex(this.classHash);
  }

  private testClassHash(classHash: string): boolean {
    return this.classHash === Starknet.num.cleanHex(classHash);
  }

  private async getFormat(): Promise<SignatureFormat> {
    if (
      this.testClassHash(
        '0x1a736d6ed154502257f02b1ccdf4d9d1089f80811cd6acad48e6b6a9d1f2003',
      )
    ) {
      return 'argent-v0.3.0';
    }

    if (
      this.testClassHash(
        '0x29927c8af6bccf3f6fda035981e765a7bdbf18a2dc0d630494f8758aa908e2b',
      )
    ) {
      return 'argent-v0.3.1';
    }

    if (
      this.testClassHash(
        '0x036078334509b514626504edc9fb252328d1a240e4e948bef8d0c08dff45927f',
      )
    ) {
      const ownerTypeResp = (await this.contract.call(
        'get_owner_type',
      )) as Starknet.CairoCustomEnum;

      const ownerType = ownerTypeResp.activeVariant();

      switch (ownerType) {
        case 'Starknet':
          return 'argent-v0.4.0-starknet-signer';
        case 'Secp256k1':
          return 'argent-v0.4.0-secp256k1-signer';
        case 'Secp256r1':
          return 'argent-v0.4.0-secp256r1-signer';
        case 'Eip191':
          return 'argent-v0.4.0-eip191-signer';
        case 'Webauthn':
          return 'argent-v0.4.0-webauthn-signer';
        default:
          return 'unknown';
      }
    }

    if (
      this.testClassHash(
        '0x0381f14e5e0db5889c981bf050fb034c0fbe0c4f070ee79346a05dbe2bf2af90',
      )
    ) {
      return 'argent-multicall';
    }

    if (
      this.testClassHash(
        '0x737ee2f87ce571a58c6c8da558ec18a07ceb64a6172d5ec46171fbc80077a48',
      )
    ) {
      return 'argent-multisig-v0.1.0';
    }

    if (
      this.testClassHash(
        '0x6e150953b26271a740bf2b6e9bca17cc52c68d765f761295de51ceb8526ee72',
      )
    ) {
      return 'argent-multisig-v0.1.1';
    }

    if (
      this.testClassHash(
        '0x07aeca3456816e3b833506d7cc5c1313d371fbdb0ae95ee70af72a4ddbf42594',
      )
    ) {
      return 'argent-multisig-v0.2.0';
    }

    // https://github.com/myBraavos/braavos-cairo/blob/6efdfd597bb051e99c79a512fccd14ee2523c898/README_MOA.md
    if (
      this.testClassHash(
        '0x041bf1e71792aecb9df3e9d04e1540091c5e13122a731e02bec588f71dc1a5c3',
      )
    ) {
      return 'braavos-multi-owner-v1.0.0';
    }

    // https://github.com/myBraavos/braavos-cairo/tree/v1.0.0
    if (
      this.testClassHash(
        '0x00816dd0297efc55dc1e7559020a3a825e81ef734b558f03c83325d4da7e6253',
      )
    ) {
      const multiSigThreshold = (await this.contract.call(
        'get_multisig_threshold',
      )) as bigint;

      if (multiSigThreshold !== 0n) {
        return 'braavos-v1.0.0-multisig';
      }

      const signers = (await this.contract.call('get_signers')) as {
        readonly secp256r1?: string[];
        readonly stark?: string[];
        readonly webauthn?: string[];
      };

      if (signers.secp256r1 != null && signers.secp256r1.length > 0)
        return 'braavos-v1.0.0-strong-signer';
      if (signers.webauthn != null && signers.webauthn.length > 0)
        return 'braavos-v1.0.0-strong-signer';

      if (signers.stark != null && signers.stark.length === 1)
        return 'braavos-v1.0.0-stark-signer';

      return 'unknown';
    }

    return 'unknown';
  }

  async check(): Promise<CheckResult> {
    this.signatureFormat = await this.getFormat();

    switch (this.signatureFormat) {
      case 'argent-v0.3.0':
      case 'argent-v0.3.1':
      case 'argent-v0.4.0-starknet-signer':
      case 'braavos-v1.0.0-stark-signer':
        return { ok: true };
      case 'argent-v0.4.0-secp256k1-signer':
        return {
          ok: false,
          reason: 'Argent Secp256k1Signer is not supported',
        };
      case 'argent-v0.4.0-secp256r1-signer':
        return {
          ok: false,
          reason: 'Argent Secp256r1Signer is not supported',
        };
      case 'argent-v0.4.0-eip191-signer':
        return {
          ok: false,
          reason: 'Argent Eip191Signer is not supported',
        };
      case 'argent-v0.4.0-webauthn-signer':
        return {
          ok: false,
          reason: 'Argent WebauthnSigner is not supported',
        };
      case 'argent-multicall':
        return {
          ok: false,
          reason: 'Argent multicall is not supported',
        };
      case 'argent-multisig-v0.1.0':
      case 'argent-multisig-v0.1.1':
      case 'argent-multisig-v0.2.0':
        return {
          ok: false,
          reason: 'Argent multisig is not supported',
        };
      case 'braavos-v1.0.0-strong-signer':
        return {
          ok: false,
          reason: 'Braavos strong signer is not supported',
        };
      case 'braavos-v1.0.0-multisig':
        return {
          ok: false,
          reason: 'Braavos multisig is not supported',
        };
      case 'braavos-multi-owner-v1.0.0':
        return {
          ok: false,
          reason: 'Braavos Multi Owner Account is not supported',
        };
      case 'unknown':
        return {
          ok: false,
          reason: 'Unsupported account contract',
        };
      // no default
    }
  }

  getSeedFromSignature(signature: Starknet.Signature): string {
    const segments = Starknet.stark.signatureToHexArray(signature);

    if (this.signatureFormat == null) {
      throw new Error('Check account contract support first');
    }

    switch (this.signatureFormat) {
      case 'argent-v0.3.0':
      case 'argent-v0.3.1': {
        const [r, _s] = segments;
        if (r == null) throw new Error('Argent signature is missing R segment');
        return r;
      }

      case 'argent-v0.4.0-starknet-signer': {
        if (segments.length === 2 || segments.length === 4) {
          const [r, _s] = segments;
          if (r == null)
            throw new Error('Argent signature is missing R segment');
          return r;
        }
        if (segments.length === 5 || segments.length === 9) {
          const [_numSignatures, _sigType, _pubKey, r, _s] = segments;
          if (r == null)
            throw new Error('Argent signature is missing R segment');
          return r;
        }
        throw new Error('Unsupported Argent signature');
      }

      case 'braavos-v1.0.0-stark-signer': {
        if (segments.length === 2) {
          const [r, _s] = segments;
          if (r == null)
            throw new Error('Braavos signature is missing R segment');
          return r;
        }
        if (segments.length === 3) {
          const [_signerType, r, _s] = segments;
          if (r == null)
            throw new Error('Braavos signature is missing R segment');
          return r;
        }
        throw new Error('Unsupported Braavos signature');
      }

      case 'argent-v0.4.0-secp256k1-signer':
      case 'argent-v0.4.0-secp256r1-signer':
      case 'argent-v0.4.0-eip191-signer':
      case 'argent-v0.4.0-webauthn-signer':
      case 'argent-multicall':
      case 'argent-multisig-v0.1.0':
      case 'argent-multisig-v0.1.1':
      case 'argent-multisig-v0.2.0':
      case 'braavos-v1.0.0-strong-signer':
      case 'braavos-v1.0.0-multisig':
      case 'braavos-multi-owner-v1.0.0':
        throw new Error(`${this.signatureFormat} is not supported`);

      case 'unknown':
        throw new Error('Unsupported account contract');

      // no default
    }
  }
}