import { CHAIN_IDS, type Network } from 'fuels';

export const DEFAULT_NETWORKS: Array<Partial<Network>> = [
  {
    chainId: CHAIN_IDS.fuel.testnet,
    url: 'https://testnet.fuel.network/v1/graphql',
  },
  {
    chainId: CHAIN_IDS.fuel.devnet,
    url: 'https://devnet.fuel.network/v1/graphql',
  },
  {
    chainId: CHAIN_IDS.fuel.mainnet,
    url: 'https://mainnet.fuel.network/v1/graphql',
  },
];

export const getProviderUrl = (chainId: number): string => {
  const network = DEFAULT_NETWORKS.find(
    (network) => network.chainId === chainId,
  );
  if (!network || !network.url) {
    throw new Error(`Network with chainId ${chainId} not found`);
  }

  return network.url;
};