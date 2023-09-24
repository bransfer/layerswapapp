export type Configs = {
    alreadyFamiliarWithCoinbaseConnect?: boolean,
    connectedWallet?: {
      isConnected?: boolean;
      address?: string;
      icon?: string;
      balance?: number
    }
  }