import {
    type AbiMap,
    Address,
    type Asset,
    type BytesLike,
    type ConnectorMetadata,
    FuelConnector,
    FuelConnectorEventTypes,
    type JsonAbi,
    type Network,
    type SelectNetworkArguments,
    type TransactionRequestLike,
    type Version,
    ZeroBytes32,
    bn,
    calculateGasFee,
    concat,
    transactionRequestify,
  } from 'fuels';
  
  import { PredicateFactory, getMockedSignatureIndex } from './PredicateFactory';
  import type { PredicateWalletAdapter } from './PredicateWalletAdapter';
  import type {
    ConnectorConfig,
    Maybe,
    MaybeAsync,
    PredicateConfig,
    PredicateVersion,
    PreparedTransaction,
    ProviderDictionary,
    SignedMessageCustomCurve,
  } from './types';
  
  export abstract class PredicateConnector extends FuelConnector {
    public connected = false;
    public installed = false;
    external = true;
    public events = FuelConnectorEventTypes;
    protected predicateAddress!: string;
    protected customPredicate: Maybe<PredicateConfig>;
    protected predicateAccount: Maybe<PredicateFactory> = null;
    protected subscriptions: Array<() => void> = [];
    protected hasProviderSucceeded = true;
  
    private _predicateVersions!: Array<PredicateFactory>;
  
    public abstract name: string;
    public abstract metadata: ConnectorMetadata;
  
    public abstract sendTransaction(
      address: string,
      transaction: TransactionRequestLike,
    ): Promise<string>;
    public abstract connect(): Promise<boolean>;
    public abstract disconnect(): Promise<boolean>;
  
    protected abstract configProviders(config: ConnectorConfig): MaybeAsync<void>;
    protected abstract getWalletAdapter(): PredicateWalletAdapter;
    protected abstract getPredicateVersions(): Record<string, PredicateVersion>;
    protected abstract getAccountAddress(): MaybeAsync<Maybe<string>>;
    protected abstract getProviders(): Promise<ProviderDictionary>;
    protected abstract requireConnection(): MaybeAsync<void>;
    protected abstract walletAccounts(): Promise<Array<string>>;
    abstract signMessageCustomCurve(
      _message: string,
    ): Promise<SignedMessageCustomCurve>;
  
    protected async emitAccountChange(
      address: string,
      connected = true,
    ): Promise<void> {
      await this.setupPredicate();
      this.emit(this.events.connection, connected);
      this.emit(
        this.events.currentAccount,
        this.predicateAccount?.getPredicateAddress(address),
      );
      this.emit(
        this.events.accounts,
        this.predicateAccount?.getPredicateAddresses(await this.walletAccounts()),
      );
    }
  
    protected get predicateVersions(): Array<PredicateFactory> {
      if (!this._predicateVersions) {
        this._predicateVersions = Object.entries(this.getPredicateVersions())
          .map(
            ([key, pred]) =>
              new PredicateFactory(
                this.getWalletAdapter(),
                pred.predicate,
                key,
                pred.generatedAt,
              ),
          )
          .sort((a, b) => a.sort(b));
      }
  
      return this._predicateVersions;
    }
  
    protected isAddressPredicate(b: BytesLike, walletAccount: string): boolean {
      return this.predicateVersions.some(
        (predicate) => predicate.getPredicateAddress(walletAccount) === b,
      );
    }
  
    protected async getCurrentUserPredicate(): Promise<Maybe<PredicateFactory>> {
      const oldFirstPredicateVersions = [...this.predicateVersions].reverse();
      for (const predicateInstance of oldFirstPredicateVersions) {
        const address = await this.getAccountAddress();
        if (!address) {
          continue;
        }
  
        const { fuelProvider } = await this.getProviders();
        const predicate = predicateInstance.build(address, fuelProvider, [1]);
  
        const balance = await predicate.getBalance();
  
        if (!balance.isZero()) {
          return predicateInstance;
        }
      }
  
      return null;
    }
  
    protected getNewestPredicate(): Maybe<PredicateFactory> {
      return this.predicateVersions[0];
    }
  
    protected async setupPredicate(): Promise<PredicateFactory> {
      if (this.customPredicate?.abi && this.customPredicate?.bin) {
        this.predicateAccount = new PredicateFactory(
          this.getWalletAdapter(),
          this.customPredicate,
          'custom',
        );
        this.predicateAddress = 'custom';
  
        return this.predicateAccount;
      }
  
      const predicate =
        (await this.getCurrentUserPredicate()) ?? this.getNewestPredicate();
      if (!predicate) throw new Error('No predicate found');
  
      this.predicateAddress = predicate.getRoot();
      this.predicateAccount = predicate;
  
      return this.predicateAccount;
    }
  
    protected subscribe(listener: () => void) {
      this.subscriptions.push(listener);
    }
  
    protected async prepareTransaction(
      address: string,
      transaction: TransactionRequestLike,
    ): Promise<PreparedTransaction> {
      if (!(await this.isConnected())) {
        throw Error('No connected accounts');
      }
  
      if (!this.predicateAccount) {
        throw Error('No predicate account found');
      }
  
      const b256Address = Address.fromDynamicInput(address).toString();
      const { fuelProvider } = await this.getProviders();
      const chainId = fuelProvider.getChainId();
      const walletAccount = this.predicateAccount.getAccountAddress(
        b256Address,
        await this.walletAccounts(),
      );
      if (!walletAccount) {
        throw Error(`No account found for ${b256Address}`);
      }
  
      const transactionRequest = transactionRequestify(transaction);
      const transactionFee = transactionRequest.maxFee.toNumber();
      const predicateSignatureIndex = getMockedSignatureIndex(
        transactionRequest.witnesses,
      );
  
      // Create a predicate and set the witness index to call in predicate`
      const predicate = this.predicateAccount.build(walletAccount, fuelProvider, [
        predicateSignatureIndex,
      ]);
      predicate.connect(fuelProvider);
  
      // To each input of the request, attach the predicate and its data
      const requestWithPredicateAttached =
        predicate.populateTransactionPredicateData(transactionRequest);
  
      const maxGasUsed =
        await this.predicateAccount.getMaxPredicateGasUsed(fuelProvider);
  
      let predictedGasUsedPredicate = bn(0);
      requestWithPredicateAttached.inputs.forEach((input) => {
        if ('predicate' in input && input.predicate) {
          input.witnessIndex = 0;
          predictedGasUsedPredicate = predictedGasUsedPredicate.add(maxGasUsed);
        }
      });
  
      // Add a placeholder for the predicate signature to count on bytes measurement from start. It will be replaced later
      requestWithPredicateAttached.witnesses[predicateSignatureIndex] = concat([
        ZeroBytes32,
        ZeroBytes32,
      ]);
  
      const { gasPriceFactor } = predicate.provider.getGasConfig();
      const { maxFee, gasPrice } = await predicate.provider.estimateTxGasAndFee({
        transactionRequest: requestWithPredicateAttached,
      });
  
      const predicateSuccessFeeDiff = calculateGasFee({
        gas: predictedGasUsedPredicate,
        priceFactor: gasPriceFactor,
        gasPrice,
      });
  
      const feeWithFat = maxFee.add(predicateSuccessFeeDiff);
      const isNeededFatFee = feeWithFat.gt(transactionFee);
  
      if (isNeededFatFee) {
        // add more 10 just in case sdk fee estimation is not accurate
        requestWithPredicateAttached.maxFee = feeWithFat.add(10);
      }
  
      // Attach missing inputs (including estimated predicate gas usage) / outputs to the request
      await predicate.provider.estimateTxDependencies(
        requestWithPredicateAttached,
      );
  
      return {
        predicate,
        request: requestWithPredicateAttached,
        transactionId: requestWithPredicateAttached.getTransactionId(chainId),
        account: walletAccount,
        transactionRequest,
      };
    }
  
    public clearSubscriptions() {
      if (!this.subscriptions) {
        return;
      }
      this.subscriptions.forEach((listener) => listener());
      this.subscriptions = [];
    }
  
    public async ping(): Promise<boolean> {
      this.getProviders()
        .catch(() => {
          this.hasProviderSucceeded = false;
        })
        .then(() => {
          this.hasProviderSucceeded = true;
        });
      return this.hasProviderSucceeded;
    }
  
    public async version(): Promise<Version> {
      return { app: '0.0.0', network: '0.0.0' };
    }
  
    public async isConnected(): Promise<boolean> {
      await this.requireConnection();
      const accounts = await this.accounts();
      return accounts.length > 0;
    }
  
    public async accounts(): Promise<Array<string>> {
      if (!this.predicateAccount) {
        return [];
      }
  
      const accs = await this.walletAccounts();
      return this.predicateAccount.getPredicateAddresses(accs);
    }
  
    public async currentAccount(): Promise<string | null> {
      if (!(await this.isConnected())) {
        throw Error('No connected accounts');
      }
      if (!this.predicateAccount) {
        throw Error('No predicate account found');
      }
  
      const account = await this.getAccountAddress();
      return account ? this.predicateAccount.getPredicateAddress(account) : null;
    }
  
    public async networks(): Promise<Network[]> {
      return [await this.currentNetwork()];
    }
  
    public async currentNetwork(): Promise<Network> {
      const { fuelProvider } = await this.getProviders();
      const chainId = fuelProvider.getChainId();
  
      return { url: fuelProvider.url, chainId: chainId };
    }
  
    public async signMessage(
      _address: string,
      _message: string,
    ): Promise<string> {
      throw new Error('A predicate account cannot sign messages');
    }
  
    public async addAssets(_assets: Asset[]): Promise<boolean> {
      throw new Error('Method not implemented.');
    }
  
    public async addAsset(_asset: Asset): Promise<boolean> {
      throw new Error('Method not implemented.');
    }
  
    public async assets(): Promise<Array<Asset>> {
      return [];
    }
  
    public async addNetwork(_networkUrl: string): Promise<boolean> {
      throw new Error('Method not implemented.');
    }
  
    public async selectNetwork(
      _network: SelectNetworkArguments,
    ): Promise<boolean> {
      throw new Error('Method not implemented.');
    }
  
    public async addAbi(_abiMap: AbiMap): Promise<boolean> {
      throw new Error('Method not implemented.');
    }
  
    public async getAbi(_contractId: string): Promise<JsonAbi> {
      throw Error('Cannot get contractId ABI for a predicate');
    }
  
    public async hasAbi(_contractId: string): Promise<boolean> {
      throw Error('A predicate account cannot have an ABI');
    }
  }