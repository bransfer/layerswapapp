import { NetworkType } from "../../Models/Network";
import { LayerSwapSettings } from "../../Models/LayerSwapSettings";

export const Settings: LayerSwapSettings = {
    "networks": [
        {
            "tokens": [
                {
                    "symbol": "USDC.ero",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/usdc.ero.png",
                    "contract": "0x0bbe6b2a1440bf6175468c66efcf9669d74b67ff",
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                },
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                },
                {
                    "symbol": "USDC",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/usdc.png",
                    "contract": "0x10f6864001398d38d4175619f7c36667e9dbc8ae",
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                }
            ],
            "name": "ARBITRUM_SEPOLIA",
            "display_name": "Arbitrum One Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/arbitrum_sepolia.png",
            "chain_id": "421614",
            "node_url": "https://arbitrum-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "transaction_explorer_template": "https://sepolia.arbiscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.arbiscan.io/address/{0}",
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": "0x420000000000000000000000000000000000000F",
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "UNI",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/uni.png",
                    "contract": "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
                    "decimals": 18,
                    "price_in_usd": 9071,
                    "precision": 6,

                },
                {
                    "symbol": "WETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/weth.png",
                    "contract": "0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14",
                    "decimals": 18,
                    "price_in_usd": 3452.25,
                    "precision": 6,

                },
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                },
                {
                    "symbol": "USDC",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/usdc.png",
                    "contract": "0xF6c4b249CbCBC46f4f29F39ea69aCf68f07CF473",
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                }
            ],
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "name": "ETHEREUM_SEPOLIA",
            "display_name": "Ethereum Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
            "chain_id": "11155111",
            "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "IMMUTABLEX_SEPOLIA",
            "display_name": "ImmutableX Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/immutablex_sepolia.png",
            "chain_id": "11155111",
            "node_url": "https://api.sandbox.x.immutable.com",
            "type": NetworkType.StarkEx,
            "transaction_explorer_template": "https://immutascan.io/tx/{0}",
            "account_explorer_template": "https://immutascan.io/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "LINEA_GOERLI",
            "display_name": "Linea Goerli",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/linea_goerli.png",
            "chain_id": "59140",
            "node_url": "https://rpc.goerli.linea.build",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://goerli.lineascan.build/tx/{0}",
            "account_explorer_template": "https://goerli.lineascan.build/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "USDC",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/usdc.png",
                    "contract": "0x745884cd9cFA3185C3a3917e47cbfCCcc007a582",
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                },
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": "qwe",
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "OPTIMISM_SEPOLIA",
            "display_name": "Optimism Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/optimism_sepolia.png",
            "chain_id": "11155420",
            "node_url": "https://rpc.ankr.com/optimism_sepolia/008af47c2a42cff0cfabf1ba435c537f1367bcba9ee8b2050651e95779aac3e9",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia-optimism.etherscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia-optimism.etherscan.io/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "BASE_SEPOLIA",
            "display_name": "Base Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/base_sepolia.png",
            "chain_id": "84532",
            "node_url": 'null',
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.basescan.org/tx/{0}",
            "account_explorer_template": "https://sepolia.basescan.org/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "EVMOS",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/evmos.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 0.095483,
                    "precision": 6,

                }
            ],
            "name": "EVMOS_TESTNET",
            "display_name": "Evmos Testnet",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/evmos_testnet.png",
            "chain_id": "9000",
            "node_url": 'null',
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://testnet.escan.live/tx/{0}",
            "account_explorer_template": "https://testnet.escan.live/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "USDC",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/usdc.png",
                    "contract": "Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr",
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                },
                {
                    "symbol": "SOL",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                    "contract": null,
                    "decimals": 9,
                    "price_in_usd": 189.46,
                    "precision": 6,

                }
            ],
            "name": "SOLANA_DEVNET",
            "display_name": "Solana Devnet",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/solana_devnet.png",
            "chain_id": "1399811149",
            "node_url": 'null',
            "type": NetworkType.Solana,
            "transaction_explorer_template": "https://explorer.solana.com/tx/{0}?cluster=devnet",
            "account_explorer_template": "https://explorer.solana.com/address/{0}?cluster=devnet",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "USDC",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/usdc.png",
                    "contract": null,
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                }
            ],
            "name": "BRINE_TESTNET",
            "display_name": "Brine Testnet",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/brine_testnet.png",
            "chain_id": null,
            "node_url": 'null',
            "type": NetworkType.StarkEx,
            "transaction_explorer_template": "https://testnet.brine.finance/",
            "account_explorer_template": "https://testnet.brine.finance/",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "tIMX",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/timx.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3,
                    "precision": 6,

                },
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": "0x2335EB4D77dE151c22119f7d2867b7cf3F5ff55e",
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "IMMUTABLEZK_TESTNET",
            "display_name": "Immutable zkEVM Testnet",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/immutablezk_testnet.png",
            "chain_id": "13473",
            "node_url": "https://rpc.testnet.immutable.com/",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://explorer.testnet.immutable.com/tx/{0}",
            "account_explorer_template": "https://explorer.testnet.immutable.com/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                },
                {
                    "symbol": "ARUSDC",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/arusdc.png",
                    "contract": "0x04a762673b08014b8e7a969f94cc752a93b8ae209ace1aa01fea14a22f8a865c",
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                },
                {
                    "symbol": "DAI1",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/dai1.png",
                    "contract": "0x05bfa69e3a4b25db845e3914b2a6b9157ac39fd8fbd12497b5d3ba414f9451a4",
                    "decimals": 18,
                    "price_in_usd": 0.999083,
                    "precision": 6,

                },
                {
                    "symbol": "DAI2",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/dai2.png",
                    "contract": "0x0338833f0015c69b60a6d1635f0767538c839d9d53905149e480a4d52d54db0f",
                    "decimals": 18,
                    "price_in_usd": 0.999083,
                    "precision": 6,

                }
            ],
            "name": "STARKNET_SEPOLIA",
            "display_name": "StarkNet Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/starknet_sepolia.png",
            "chain_id": "0x534e5f5345504f4c4941",
            "node_url": "https://starknet-sepolia.blastapi.io/b80cc803-ddc6-4582-9e56-481ec38ec039/rpc/v0_7",
            "type": NetworkType.Starknet,
            "transaction_explorer_template": "https://sepolia.starkscan.co/tx/{0}",
            "account_explorer_template": "https://sepolia.starkscan.co/contract/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-01-10T10:17:29.071644+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "wallet"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "TMETIS",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/tmetis.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 100.98,
                    "precision": 6,

                }
            ],
            "name": "METIS_SEPOLIA",
            "display_name": "Metis Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/metis_sepolia.png",
            "chain_id": "59901",
            "node_url": "https://sepolia.rpc.metisdevops.link/",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.explorer.metisdevops.link/tx/{0}",
            "account_explorer_template": "https://sepolia.explorer.metisdevops.link/address/{0}\r\n",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-01-12T15:15:58.168996+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": "NAHMII",
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "NAHMII_TESTNET",
            "display_name": "Nahmii Testnet",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/nahmii_testnet.png",
            "chain_id": "4062",
            "node_url": "https://ngeth.testnet.n3.nahmii.io",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://explorer.testnet.nahmii.io/tx/{0}",
            "account_explorer_template": "https://explorer.testnet.nahmii.io/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-02-12T16:37:43.198211+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "MODE_TESTNET",
            "display_name": "Mode Testnet",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/mode_testnet.png",
            "chain_id": "919",
            "node_url": "https://sepolia.mode.network",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.explorer.mode.network/tx/{0}",
            "account_explorer_template": "https://sepolia.explorer.mode.network/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-02-19T12:01:16.537629+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "BLAST_SEPOLIA",
            "display_name": "Blast Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/blast_sepolia.png",
            "chain_id": "168587773",
            "node_url": "https://rpc.ankr.com/blast_testnet_sepolia",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://testnet.blastscan.io/tx/{0}",
            "account_explorer_template": "https://testnet.blastscan.io/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-02-26T15:27:10.003491+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": "0",
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "LOOPRING_GOERLI",
            "display_name": "Loopring Goerli",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/loopring_goerli.png",
            "chain_id": "5",
            "node_url": 'null',
            "type": NetworkType.ZkSyncLite,
            "transaction_explorer_template": "",
            "account_explorer_template": "",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-03-05T14:07:36.71174+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                },
                {
                    "symbol": "USDC",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/usdc.png",
                    "contract": "0xAc746B083d85548faA74282D0935002DCB81fc56",
                    "decimals": 6,
                    "price_in_usd": 0.99977,
                    "precision": 6,

                }
            ],
            "name": "ZKSYNCERA_SEPOLIA",
            "display_name": "zkSync Era Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/zksyncera_sepolia.png",
            "chain_id": "300",
            "node_url": "https://zksync-era-sepolia.blockpi.network/v1/rpc/public",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.explorer.zksync.io/tx/{0}",
            "account_explorer_template": "https://sepolia.explorer.zksync.io/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-03-18T12:01:24.240915+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": "0x4D50106E64F3aBFb1bDC85Fe8161e2b23a502625",
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                },
                {
                    "symbol": "ZETA",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/zeta.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 2,
                    "precision": 6,

                }
            ],
            "name": "ZETACHAIN_TESTNET",
            "display_name": "Zetachain Testnet",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/zetachain_testnet.png",
            "chain_id": "7001",
            "node_url": 'null',
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://athens.explorer.zetachain.com/tx/{0}",
            "account_explorer_template": "https://athens.explorer.zetachain.com/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-03-19T19:36:01.889627+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": null,
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        },
        {
            "tokens": [
                {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3453.45,
                    "precision": 6,

                }
            ],
            "name": "KROMA_SEPOLIA",
            "display_name": "Kroma Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/kroma_sepolia.png",
            "chain_id": "2358",
            "node_url": 'null',
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://blockscout.sepolia.kroma.network/tx/{0}",
            "account_explorer_template": "https://blockscout.sepolia.kroma.network/address/{0}",
            "token": {
                "symbol": "SOL",
                "logo": "https://prodlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/sol.png",
                "contract": null,
                "decimals": 9,
                "price_in_usd": 0,
                "precision": 8,
                "listing_date": "2023-09-14T16:44:58.549571+00:00"
            },
            "metadata": {
                "listing_date": "2024-03-19T22:02:43.744528+00:00",
                "evm_oracle_contract": null,
                "evm_multicall_contract": "",
                //TODO these are not the correct values
                htlc_native_contract: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
                lp_address: "0x05ebf5ca9020e2c34cb0edbee42ceaf61404a2bbd269837f5fe4cca0c6bf5b90",
            },
            "deposit_methods": [
                "Wallet",
                "DepositAddress"
            ]
        }
    ],
    // "exchanges": [
    //     {
    //         "token_groups": [
    //             {
    //                 "symbol": "USDC",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/usdc.png"
    //             },
    //             {
    //                 "symbol": "ETH",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/eth.png"
    //             }
    //         ],
    //         "name": "STRIPE",
    //         "display_name": "Stripe (Only US)",
    //         "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/exchanges/stripe.png",
    //         "metadata": {
    //             "o_auth": null,
    //             "listing_date": "2023-05-23T16:16:30.241581+00:00"
    //         }
    //     },
    //     {
    //         "token_groups": [
    //             {
    //                 "symbol": "USDC",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/usdc.png"
    //             },
    //             {
    //                 "symbol": "ETH",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/eth.png"
    //             }
    //         ],
    //         "name": "COINBASE",
    //         "display_name": "Coinbase",
    //         "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/exchanges/coinbase.png",
    //         "metadata": {
    //             "o_auth": {
    //                 "authorize_url": "https://www.coinbase.com/oauth/authorize?client_id=d1794c48e67c2eea97cef6154f42d0e099b13805264e739c96a9175a4acd9308&redirect_uri=https%3A%2F%2Fbridge-api-dev.layerswap.cloud%2Fapi%2Fcallback%2Fcoinbase&response_type=code&account=all&scope=wallet%3Atransactions%3Aread%2Cwallet%3Auser%3Aread%2Cwallet%3Aaccounts%3Aread%2Cwallet%3Atransactions%3Asend%2Cwallet%3Auser%3Aemail&meta[send_limit_amount]=1&meta[send_limit_currency]=USD&meta[send_limit_period]=month&state=",
    //                 "connect_url": "https://www.coinbase.com/oauth/authorize?client_id=d1794c48e67c2eea97cef6154f42d0e099b13805264e739c96a9175a4acd9308&redirect_uri=https%3A%2F%2Fbridge-api-dev.layerswap.cloud%2Fapi%2Fcallback%2Fcoinbase&response_type=code&account=all&scope=wallet%3Auser%3Aemail%2Cwallet%3Aaddresses%3Aread%2Cwallet%3Aaddresses%3Acreate&state="
    //             },
    //             "listing_date": "2021-07-15T20:32:51.223453+00:00"
    //         }
    //     },
    //     {
    //         "token_groups": [
    //             {
    //                 "symbol": "USDC",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/usdc.png"
    //             },
    //             {
    //                 "symbol": "ETH",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/eth.png"
    //             }
    //         ],
    //         "name": "LSCEX",
    //         "display_name": "Fake CEX (for testing)",
    //         "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/exchanges/lscex.png",
    //         "metadata": {
    //             "o_auth": null,
    //             "listing_date": "2023-01-13T13:23:55.633636+00:00"
    //         }
    //     },
    //     {
    //         "token_groups": [
    //             {
    //                 "symbol": "USDC",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/usdc.png"
    //             },
    //             {
    //                 "symbol": "ETH",
    //                 "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/eth.png"
    //             }
    //         ],
    //         "name": "PIPE",
    //         "display_name": "Pipe",
    //         "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/exchanges/pipe.png",
    //         "metadata": {
    //             "o_auth": null,
    //             "listing_date": "2023-10-26T11:33:05.256894+00:00"
    //         }
    //     }
    // ],
    // "sources": [],
    // "destinations": []
}

export const SettingChains: any = [
    {
        "id": 42161,
        "name": "Arbitrum One",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://arb1.arbitrum.io/rpc"
                ]
            },
            "public": {
                "http": [
                    "https://arb1.arbitrum.io/rpc"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://arbiscan.io"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 42170,
        "name": "Arbitrum Nova",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://arbitrum-nova.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://arbitrum-nova.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://nova.arbiscan.io"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 3776,
        "name": "Astar zkEVM",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.startale.com/astar-zkevm"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.startale.com/astar-zkevm"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://astar-zkevm.explorer.startale.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 43114,
        "name": "Avalanche",
        "nativeCurrency": {
            "name": "AVAX",
            "symbol": "AVAX",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc"
                ]
            },
            "public": {
                "http": [
                    "https://ava-mainnet.public.blastapi.io/ext/bc/C/rpc"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://snowtrace.io"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 8453,
        "name": "Base",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://base-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://base-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://basescan.org"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 81457,
        "name": "Blast",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://blastl2-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://blastl2-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://blastscan.io"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 60808,
        "name": "Bob",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.gobob.xyz/"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.gobob.xyz/"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.gobob.xyz"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 56,
        "name": "BSC",
        "nativeCurrency": {
            "name": "BNB",
            "symbol": "BNB",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://lb.drpc.org/ogrpc?network=bsc&dkey=ArPkRplEc0Blq_2CpG9Z__4Tj6aBjcER7qzvYkscDoZX"
                ]
            },
            "public": {
                "http": [
                    "https://lb.drpc.org/ogrpc?network=bsc&dkey=ArPkRplEc0Blq_2CpG9Z__4Tj6aBjcER7qzvYkscDoZX"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://bscscan.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 1,
        "name": "Ethereum",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://eth-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://eth-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://etherscan.io"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 9001,
        "name": "Evmos",
        "nativeCurrency": {
            "name": "EVMOS",
            "symbol": "EVMOS",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://evmos-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://evmos-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://escan.live"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 122,
        "name": "Fuse",
        "nativeCurrency": {
            "name": "FUSE",
            "symbol": "FUSE",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.fuse.io"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.fuse.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.fuse.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 100,
        "name": "Gnosis",
        "nativeCurrency": {
            "name": "xDAI",
            "symbol": "xDAI",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.gnosischain.com/"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.gnosischain.com/"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://gnosisscan.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 128,
        "name": "Huobi Eco Chain",
        "nativeCurrency": {
            "name": "HT",
            "symbol": "HT",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://http-mainnet.hecochain.com"
                ]
            },
            "public": {
                "http": [
                    "https://http-mainnet.hecochain.com"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://www.hecoinfo.com"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 13371,
        "name": "Immutable zkEVM ",
        "nativeCurrency": {
            "name": "IMX",
            "symbol": "IMX",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.immutable.com"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.immutable.com"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.immutable.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 321,
        "name": "KCC",
        "nativeCurrency": {
            "name": "KCS",
            "symbol": "KCS",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc-mainnet.kcc.network"
                ]
            },
            "public": {
                "http": [
                    "https://rpc-mainnet.kcc.network"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.kcc.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 255,
        "name": "Kroma",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://api.kroma.network"
                ]
            },
            "public": {
                "http": [
                    "https://api.kroma.network"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://kromascan.com"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 1890,
        "name": "LightLink",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://replicator.phoenix.lightlink.io/rpc/v1"
                ]
            },
            "public": {
                "http": [
                    "https://replicator.phoenix.lightlink.io/rpc/v1"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://phoenix.lightlink.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 59144,
        "name": "Linea",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.linea.build"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.linea.build"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://lineascan.build"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 1,
        "name": "Loopring",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://api3.loopring.io/api/v3"
                ]
            },
            "public": {
                "http": [
                    "https://api3.loopring.io/api/v3"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.loopring.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 169,
        "name": "Manta Pacific",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://pacific-rpc.manta.network/http"
                ]
            },
            "public": {
                "http": [
                    "https://pacific-rpc.manta.network/http"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://manta-pacific.calderaexplorer.xyz"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 5000,
        "name": "Mantle",
        "nativeCurrency": {
            "name": "MNT",
            "symbol": "MNT",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.mantle.xyz"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.mantle.xyz"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.mantle.xyz"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 185,
        "name": "Mint",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.mintchain.io"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.mintchain.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.mintchain.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 34443,
        "name": "Mode",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://mode-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://mode-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.mode.network"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 4061,
        "name": "Nahmii",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.n3.nahmii.io"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.n3.nahmii.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.nahmii.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 66,
        "name": "OKT Chain (OKTC)",
        "nativeCurrency": {
            "name": "OKT",
            "symbol": "OKT",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://oktc-mainnet.blastapi.io/0087e28f-aeff-41d3-8f42-0d46f40509c9"
                ]
            },
            "public": {
                "http": [
                    "https://oktc-mainnet.blastapi.io/0087e28f-aeff-41d3-8f42-0d46f40509c9"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://www.oklink.com"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 204,
        "name": "opBNB",
        "nativeCurrency": {
            "name": "BNB",
            "symbol": "BNB",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://opbnb-mainnet-rpc.bnbchain.org"
                ]
            },
            "public": {
                "http": [
                    "https://opbnb-mainnet-rpc.bnbchain.org"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://opbnbscan.com"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 10,
        "name": "Optimism",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://optimism-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://optimism-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://optimistic.etherscan.io"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": null,
        "name": "Osmosis",
        "nativeCurrency": {
            "name": "OSMO",
            "symbol": "OSMO",
            "decimals": 6
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://osmosis-rpc.publicnode.com:443"
                ]
            },
            "public": {
                "http": [
                    "https://osmosis-rpc.publicnode.com:443"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://mintscan.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 424,
        "name": "Public Goods Network",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.publicgoods.network"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.publicgoods.network"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.publicgoods.network"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 137,
        "name": "Polygon",
        "nativeCurrency": {
            "name": "MATIC",
            "symbol": "MATIC",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://polygon-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://polygon-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://polygonscan.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 1101,
        "name": "Polygon zkEVM",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://polygon-zkevm-mainnet.public.blastapi.io"
                ]
            },
            "public": {
                "http": [
                    "https://polygon-zkevm-mainnet.public.blastapi.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://zkevm.polygonscan.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 690,
        "name": "Redstone",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.redstonechain.com"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.redstonechain.com"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.redstone.xyz"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 570,
        "name": "Rollux",
        "nativeCurrency": {
            "name": "SYS",
            "symbol": "SYS",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.rollux.com\t"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.rollux.com\t"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.rollux.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 2020,
        "name": "Ronin",
        "nativeCurrency": {
            "name": "RON",
            "symbol": "RON",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://api-gateway.skymavis.com/rpc?apikey=hzLZKPrDuqRz5TAdxywpVEtG8QT9Bt8v"
                ]
            },
            "public": {
                "http": [
                    "https://api-gateway.skymavis.com/rpc?apikey=hzLZKPrDuqRz5TAdxywpVEtG8QT9Bt8v"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://app.roninchain.com"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 534352,
        "name": "Scroll",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.scroll.io"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.scroll.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://scrollscan.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    },
    {
        "id": 0,
        "name": "Solana",
        "nativeCurrency": {
            "name": "SOL",
            "symbol": "SOL",
            "decimals": 9
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://odella-kzfk20-fast-mainnet.helius-rpc.com/"
                ]
            },
            "public": {
                "http": [
                    "https://odella-kzfk20-fast-mainnet.helius-rpc.com/"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://solscan.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 23448594291968336,
        "name": "Starknet",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://starknet-mainnet.blastapi.io/0087e28f-aeff-41d3-8f42-0d46f40509c9/rpc/v0_7"
                ]
            },
            "public": {
                "http": [
                    "https://starknet-mainnet.blastapi.io/0087e28f-aeff-41d3-8f42-0d46f40509c9/rpc/v0_7"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://starkscan.co"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 167000,
        "name": "Taiko",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.mainnet.taiko.xyz"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.mainnet.taiko.xyz"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://taikoscan.io"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 0,
        "name": "TON",
        "nativeCurrency": {
            "name": "TON",
            "symbol": "TON",
            "decimals": 9
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://toncenter.com/api/v2/jsonRPC"
                ]
            },
            "public": {
                "http": [
                    "https://toncenter.com/api/v2/jsonRPC"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://tonscan.org"
            }
        },
        "contracts": {},
        "fees": {}
    },
    {
        "id": 196,
        "name": "X Layer",
        "nativeCurrency": {
            "name": "OKB",
            "symbol": "OKB",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://endpoints.omniatech.io/v1/xlayer/mainnet/public"
                ]
            },
            "public": {
                "http": [
                    "https://endpoints.omniatech.io/v1/xlayer/mainnet/public"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://www.okx.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 7000,
        "name": "Zetachain",
        "nativeCurrency": {
            "name": "ZETA",
            "symbol": "ZETA",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://zetachain-evm.blockpi.network/v1/rpc/public\n"
                ]
            },
            "public": {
                "http": [
                    "https://zetachain-evm.blockpi.network/v1/rpc/public\n"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://zetachain.blockscout.com"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xca11bde05977b3631167028862be2a173976ca11"
            }
        },
        "fees": {}
    },
    {
        "id": 324,
        "name": "zkSync Era",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://mainnet.era.zksync.io"
                ]
            },
            "public": {
                "http": [
                    "https://mainnet.era.zksync.io"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.zksync.io"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xF9cda624FBC7e059355ce98a31693d299FACd963"
            }
        },
        "fees": {}
    },
    {
        "id": 7777777,
        "name": "Zora",
        "nativeCurrency": {
            "name": "ETH",
            "symbol": "ETH",
            "decimals": 18
        },
        "rpcUrls": {
            "default": {
                "http": [
                    "https://rpc.zora.energy"
                ]
            },
            "public": {
                "http": [
                    "https://rpc.zora.energy"
                ]
            }
        },
        "blockExplorers": {
            "default": {
                "name": "name",
                "url": "https://explorer.zora.energy"
            }
        },
        "contracts": {
            "multicall3": {
                "address": "0xcA11bde05977b3631167028862bE2a173976CA11"
            }
        },
        "fees": {}
    }
]