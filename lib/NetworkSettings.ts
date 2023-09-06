import KnownInternalNames from "./knownIds";

export enum DepositType {
    Manual = 'manual',
    Wallet = 'wallet'
}

type NetworkItemSettings = {
    [network: string]: {
        apiUri: string,
        appUri?: string,
        linkUri?: string
    }
}

const destinationOrder = [
    KnownInternalNames.Networks.StarkNetMainnet,
    KnownInternalNames.Networks.ZksyncEraMainnet,
    KnownInternalNames.Networks.ZksyncMainnet,
    KnownInternalNames.Networks.ArbitrumNova,
    KnownInternalNames.Networks.ArbitrumMainnet,
    KnownInternalNames.Networks.OptimismMainnet,
    KnownInternalNames.Networks.PolygonZkMainnet,
    KnownInternalNames.Networks.EthereumMainnet,
    KnownInternalNames.Networks.PolygonMainnet,
    KnownInternalNames.Networks.AvalancheMainnet,
    KnownInternalNames.Networks.ImmutableXMainnet,
    KnownInternalNames.Networks.LoopringMainnet,
    KnownInternalNames.Networks.BNBChainMainnet,
    KnownInternalNames.Networks.MantleMainnet,
    KnownInternalNames.Networks.PGNMainnet,
    KnownInternalNames.Networks.BaseMainnet,
    KnownInternalNames.Networks.OsmosisMainnet,
    KnownInternalNames.Networks.ZkspaceMainnet,
    KnownInternalNames.Networks.RhinoFiMainnet,
];

const sourceOrder = [
    KnownInternalNames.Networks.LineaMainnet,
    KnownInternalNames.Networks.ArbitrumMainnet,
    KnownInternalNames.Networks.EthereumMainnet,
    KnownInternalNames.Networks.StarkNetMainnet,
    KnownInternalNames.Networks.BNBChainMainnet,
    KnownInternalNames.Networks.OptimismMainnet,
    KnownInternalNames.Networks.SolanaMainnet,
    KnownInternalNames.Networks.ZksyncEraMainnet,
    KnownInternalNames.Networks.PolygonMainnet,
    KnownInternalNames.Networks.AvalancheMainnet,
    KnownInternalNames.Networks.ZksyncMainnet,
    KnownInternalNames.Networks.ArbitrumNova,
    KnownInternalNames.Networks.PolygonZkMainnet,
    KnownInternalNames.Networks.KCCMainnet,
    KnownInternalNames.Networks.LoopringMainnet,
    KnownInternalNames.Networks.ImmutableXMainnet,
    KnownInternalNames.Networks.BaseMainnet,
];

export default class NetworkSettings {
    ConfirmationWarningMessage?: string;
    UserGuideUrlForDesktop?: string;
    UserGuideUrlForMobile?: string;
    WithdrawalWarningMessage?: string;
    ChainId?: number | string;
    EstimatedTransferTime?: number;
    AddressPlaceholder?: string;
    OrderInDestination?: number;
    OrderInSource?: number;
    AccountExplorerTemplate?: string;
    Refuel?: boolean = false;
    DepositType?: DepositType = DepositType.Manual

    public static ForceDisable?: { [network: string]: { offramp: boolean, onramp: boolean, crossChain: boolean } }
    public static KnownSettings: { [network: string]: NetworkSettings } = {};

    public static ImmutableXSettings: NetworkItemSettings

    private static _isInitialized = false;
    public static Initialize() {
        if (NetworkSettings._isInitialized) {
            return;
        }

        NetworkSettings._isInitialized = true;
        NetworkSettings.ForceDisable = JSON.parse(process.env.NEXT_PUBLIC_NETWORK_FORCE_SETTINGS || "{}")

        NetworkSettings.KnownSettings[KnownInternalNames.Networks.LoopringMainnet] = {
            UserGuideUrlForDesktop: "https://docs.layerswap.io/user-docs/using-layerswap/withdrawals/loopring",
            ConfirmationWarningMessage: "You can now transfer funds directly from the GameStop wallet.",
            AccountExplorerTemplate: 'https://explorer.loopring.io/account/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ArbitrumRinkeby] = {
            ChainId: 421611,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.BNBChainMainnet] = {
            ChainId: 56,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ZksyncMainnet] = {
            ChainId: 25,
            AccountExplorerTemplate: 'https://zkscan.io/explorer/accounts/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ZksyncEraMainnet] = {
            ChainId: 324,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ZkspaceMainnet] = {
            ChainId: 13,
            AccountExplorerTemplate: 'https://zkspace.info/account/{0}'
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.EthereumGoerli] = {
            ChainId: 5,
            AccountExplorerTemplate: 'https://goerli.etherscan.io/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.MoonbeamMainnet] = {
            ChainId: 1284,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.PolygonMainnet] = {
            ChainId: 137,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ArbitrumMainnet] = {
            ChainId: 42161,
            AccountExplorerTemplate: 'https://arbiscan.io/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ArbitrumNova] = {
            ChainId: 42170,
            AccountExplorerTemplate: 'https://nova.arbiscan.io/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ArbitrumGoerli] = {
            ChainId: 421613,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.OptimismKovan] = {
            ChainId: 69,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.EthereumRinkeby] = {
            ChainId: 4,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.NahmiiMainnet] = {
            ChainId: 5551,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.BobaRinkeby] = {
            ChainId: 28,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.OptimismMainnet] = {
            ChainId: 10,
            AccountExplorerTemplate: 'https://optimistic.etherscan.io/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.AstarMainnet] = {
            ChainId: 592,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.EthereumMainnet] = {
            ChainId: 1,
            AccountExplorerTemplate: 'https://etherscan.io/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.BobaMainnet] = {
            ChainId: 288,
            AccountExplorerTemplate: 'https://blockexplorer.boba.network/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.RoninMainnet] = {
            ChainId: 2020,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.OsmosisMainnet] = {
            AddressPlaceholder: 'osmo123...ab56c',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ImmutableXMainnet] = {
            AccountExplorerTemplate: 'https://immutascan.io/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.ImmutableXGoerli] = {
            AccountExplorerTemplate: 'https://immutascan.io/address/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.BNBChainMainnet] = {
            AccountExplorerTemplate: 'https://bscscan.com/address/{0}',
            Refuel: true,
            ChainId: 56
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.StarkNetMainnet] = {
            AccountExplorerTemplate: 'https://starkscan.co/contract/{0}',
            ChainId: "0x534e5f4d41494e",
            DepositType: DepositType.Wallet
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.StarkNetGoerli] = {
            AccountExplorerTemplate: 'https://goerli.voyager.online/contract/{0}',
            ChainId: "0x534e5f474f45524c49"
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.CronosMainnet] = {
            AccountExplorerTemplate: 'https://cronoscan.com/address/{0}'
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.RhinoFiMainnet] = {
            AccountExplorerTemplate: 'https://app.rhino.fi/account/{0}',
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.SolanaMainnet] = {
            AddressPlaceholder: 'A1b2...69Ckfg'
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.SolanaTestnet] = {
            AddressPlaceholder: 'A1b2...69Ckfg'
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.DydxMainnet] = {
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.KCCMainnet] = {
            ChainId: 321,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.OKCMainnet] = {
            ChainId: 66,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.LineaMainnet] = {
            ChainId: 59144,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.BaseMainnet] = {
            ChainId: 8453,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.PGNMainnet] = {
            ChainId: 424,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.MantleMainnet] = {
            ChainId: 5000,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.AvalancheMainnet] = {
            ChainId: 43114,
        };
        NetworkSettings.KnownSettings[KnownInternalNames.Networks.PolygonZkMainnet] = {
            ChainId: 1101,
            AccountExplorerTemplate: "https://zkevm.polygonscan.com/address//{0}"
        };

        NetworkSettings.ImmutableXSettings = {
            [KnownInternalNames.Networks.ImmutableXMainnet]: {
                apiUri: "https://api.x.immutable.com/v1",
                linkUri: "https://link.x.immutable.com",
            },
            [KnownInternalNames.Networks.ImmutableXGoerli]: {
                apiUri: "https://api.sandbox.x.immutable.com/v1",
                linkUri: "https://link.sandbox.x.immutable.com"
            }
        }

        for (var k in NetworkSettings.KnownSettings) {
            let networkSetting = NetworkSettings.KnownSettings[k];
            if (networkSetting) {
                let destOrder = destinationOrder.indexOf(k);
                let srcOrder = sourceOrder.indexOf(k);

                networkSetting.OrderInDestination = destOrder < 0 ? 10000 : destOrder;
                networkSetting.OrderInSource = srcOrder < 0 ? 10000 : srcOrder;
            }
        }
    }
}

NetworkSettings.Initialize();
