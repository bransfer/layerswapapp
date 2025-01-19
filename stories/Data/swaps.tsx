import { NetworkType } from "../../Models/Network"
import { SwapStatus } from "../../Models/SwapStatus"
import { BackendTransactionStatus, TransactionType } from "../../lib/layerSwapApiClient"

export const swap = {
    "addressConfirmed": false,
    "codeRequested": false,
    "depositAddressIsFromAccount": false,
    "swapTransaction": undefined,
    "withdrawType": undefined,
    "swapResponse": {
        "deposit_actions": [
            {
                "type": "transfer",
                "to_address": "0x5dA5C2a98e26FD28914b91212b1232D58eb9bbab",
                "amount": 0.000373,
                "order": 0,
                "amount_in_base_units": "373000000000000",
                "network": {
                    "deposit_methods": [
                        "Wallet",
                        "DepositAddress"
                    ],
                    "name": "ETHEREUM_SEPOLIA",
                    "display_name": "Ethereum Sepolia",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
                    "chain_id": "11155111",
                    "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                    "type": NetworkType.EVM,
                    "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
                    "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
                    "token": {
                        "symbol": "ETH",
                        "listing_date": "2023-12-27T16:46:50.617075+00:00",
                        "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                        "contract": null,
                        "decimals": 18,
                        "price_in_usd": 3043.77,
                        "precision": 6
                    },
                    "metadata": {
                        "listing_date": "2023-12-27T16:46:50.617075+00:00"
                    },
                },
                "token": {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "fee_token": {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "call_data": "0x13e1",
                "fee": 18
            }
        ],
        "swap": {
            "exchange_account_connected": true,
            "source_address": "0x5f4025Cb72997D971e101a8FEf19422e696b4162",
            "id": "f9b0c0ca-3caa-483e-9bc2-36332b6972c1",
            "created_date": "2024-04-16T14:41:35.725954+00:00",
            "source_network": {
                "name": "ETHEREUM_SEPOLIA",
                "display_name": "Ethereum Sepolia",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
                "chain_id": "11155111",
                "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                "type": NetworkType.EVM,
                "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
                "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
                "token": {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "metadata": {
                    "listing_date": "2023-12-27T16:46:50.617075+00:00"
                },
                "deposit_methods": []
            },
            "source_token": {
                "symbol": "ETH",
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "source_exchange": undefined,
            "destination_network": {
                "name": "ARBITRUM_SEPOLIA",
                "display_name": "Arbitrum One Sepolia",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/arbitrum_sepolia.png",
                "chain_id": "421614",
                "node_url": "https://arbitrum-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                "type": NetworkType.EVM,
                "transaction_explorer_template": "https://sepolia.arbiscan.io/tx/{0}",
                "account_explorer_template": "https://sepolia.arbiscan.io/address/{0}",
                "token": {
                    "symbol": "ETH",
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "metadata": {
                    "listing_date": "2023-12-27T16:46:50.617075+00:00",
                    "evm_oracle_contract": "0x420000000000000000000000000000000000000F"
                },
                "deposit_methods": []
            },
            "destination_token": {
                "symbol": "ETH",
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "destination_exchange": undefined,
            "requested_amount": 0.000373,
            "destination_address": "0x5f4025cb72997d971e101a8fef19422e696b4162",
            "status": SwapStatus.UserTransferPending,
            "use_deposit_address": false,
            "metadata": {
                "sequence_number": 5089,
                "reference_id": "vmksv",
                "app": ""
            },
            "transactions": [
                {
                    "from": "0x5f4025cb72997d971e101a8fef19422e696b4162",
                    "to": "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
                    "timestamp": "2024-04-16T14:41:48+00:00",
                    "transaction_hash": "0xfa3f6a6c331a56c1bb4b8bde55d53ae75f26d2d17861951a56b78c125a138130",
                    "confirmations": 3,
                    "max_confirmations": 3,
                    "amount": 0.000373,
                    "type": TransactionType.Input,
                    "status": BackendTransactionStatus.Completed,
                    "created_date": "",
                    "usd_price": 10,
                    "usd_value": 10
                },
            ]
        },
        "quote": {
            "receive_amount": 0.000329,
            "min_receive_amount": 0.00032571,
            "blockchain_fee": 0.000012,
            "service_fee": 0.000032,
            "avg_completion_time": "00:00:47.5186220",
            "total_fee": 0.000044,
            "total_fee_in_usd": 0.13392588
        },
        "refuel": undefined,
    }
}

export const failedSwap: any = {
    "deposit_actions": [
        {
            "type": "transfer",
            "to_address": "0x5dA5C2a98e26FD28914b91212b1232D58eb9bbab",
            "amount": 0.000373,
            "order": 0,
            "amount_in_base_units": "373000000000000",
            "network": {
                "name": "ETHEREUM_SEPOLIA",
                "display_name": "Ethereum Sepolia",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
                "chain_id": "11155111",
                "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                "type": NetworkType.EVM,
                "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
                "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
                "token": {
                    "symbol": "ETH",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "metadata": {
                    "listing_date": "2023-12-27T16:46:50.617075+00:00"
                },
            },
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "fee_token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "call_data": "0x13e1",
            "fee": 18
        }
    ],
    "swap": {
        "exchange_account_connected": true,
        "source_address": "0x5f4025Cb72997D971e101a8FEf19422e696b4162",
        "id": "f9b0c0ca-3caa-483e-9bc2-36332b6972c1",
        "created_date": "2024-04-16T14:41:35.725954+00:00",
        "source_network": {
            "name": "ETHEREUM_SEPOLIA",
            "display_name": "Ethereum Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
            "chain_id": "11155111",
            "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00"
            },
            "deposit_methods": []
        },
        "source_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "source_exchange": undefined,
        "destination_network": {
            "name": "ARBITRUM_SEPOLIA",
            "display_name": "Arbitrum One Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/arbitrum_sepolia.png",
            "chain_id": "421614",
            "node_url": "https://arbitrum-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.arbiscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.arbiscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": "0x420000000000000000000000000000000000000F"
            },
            "deposit_methods": []
        },
        "destination_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "destination_exchange": undefined,
        "requested_amount": 0.000373,
        "destination_address": "0x5f4025cb72997d971e101a8fef19422e696b4162",
        "status": SwapStatus.Failed,
        "use_deposit_address": false,
        "metadata": {
            "sequence_number": 5089,
            "reference_id": "vmksv",
            "app": ""
        },
        "transactions": [
            {
                "from": "0x5f4025cb72997d971e101a8fef19422e696b4162",
                "to": "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
                "timestamp": "2024-04-16T14:41:48+00:00",
                "transaction_hash": "0xfa3f6a6c331a56c1bb4b8bde55d53ae75f26d2d17861951a56b78c125a138130",
                "confirmations": 3,
                "max_confirmations": 3,
                "amount": 0.000373,
                "type": TransactionType.Input,
                "status": BackendTransactionStatus.Completed,
                "created_date": "",
                "usd_price": 10,
                "usd_value": 10
            },
        ]
    },
    "quote": {
        "receive_amount": 0.000329,
        "min_receive_amount": 0.00032571,
        "blockchain_fee": 0.000012,
        "service_fee": 0.000032,
        "avg_completion_time": "00:00:47.5186220",
        "total_fee": 0.000044,
        "total_fee_in_usd": 0.13392588
    },
    "refuel": undefined,
}

export const failedInputSwap: any = {
    "deposit_actions": [
        {
            "type": "transfer",
            "to_address": "0x5dA5C2a98e26FD28914b91212b1232D58eb9bbab",
            "amount": 0.000373,
            "order": 0,
            "amount_in_base_units": "373000000000000",
            "network": {
                "name": "ETHEREUM_SEPOLIA",
                "display_name": "Ethereum Sepolia",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
                "chain_id": "11155111",
                "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                "type": NetworkType.EVM,
                "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
                "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
                "token": {
                    "symbol": "ETH",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "metadata": {
                    "listing_date": "2023-12-27T16:46:50.617075+00:00"
                },
            },
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "fee_token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "call_data": "0x13e1",
            "fee": 18
        }
    ],
    "swap": {
        "exchange_account_connected": true,
        "source_address": "0x5f4025Cb72997D971e101a8FEf19422e696b4162",
        "id": "f9b0c0ca-3caa-483e-9bc2-36332b6972c1",
        "created_date": "2024-04-16T14:41:35.725954+00:00",
        "source_network": {
            "name": "ETHEREUM_SEPOLIA",
            "display_name": "Ethereum Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
            "chain_id": "11155111",
            "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00"
            },
            "deposit_methods": []
        },
        "source_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "source_exchange": undefined,
        "destination_network": {
            "name": "ARBITRUM_SEPOLIA",
            "display_name": "Arbitrum One Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/arbitrum_sepolia.png",
            "chain_id": "421614",
            "node_url": "https://arbitrum-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.arbiscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.arbiscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": "0x420000000000000000000000000000000000000F"
            },
            "deposit_methods": []
        },
        "destination_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "destination_exchange": undefined,
        "requested_amount": 0.000373,
        "destination_address": "0x5f4025cb72997d971e101a8fef19422e696b4162",
        "status": SwapStatus.Failed,
        "use_deposit_address": false,
        "metadata": {
            "sequence_number": 5089,
            "reference_id": "vmksv",
            "app": ""
        },
        "transactions": [
            {
                "from": "0x5f4025cb72997d971e101a8fef19422e696b4162",
                "to": "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
                "timestamp": "2024-04-16T14:41:48+00:00",
                "transaction_hash": "0xfa3f6a6c331a56c1bb4b8bde55d53ae75f26d2d17861951a56b78c125a138130",
                "confirmations": 3,
                "max_confirmations": 3,
                "amount": 0.000373,
                "type": TransactionType.Input,
                "status": BackendTransactionStatus.Failed,
                "created_date": "",
                "usd_price": 10,
                "usd_value": 10
            },
        ]
    },
    "quote": {
        "receive_amount": 0.000329,
        "min_receive_amount": 0.00032571,
        "blockchain_fee": 0.000012,
        "service_fee": 0.000032,
        "avg_completion_time": "00:00:47.5186220",
        "total_fee": 0.000044,
        "total_fee_in_usd": 0.13392588
    },
    "refuel": undefined,
}

export const failedSwapOutOfRange: any = {
    "deposit_actions": [
        {
            "type": "transfer",
            "to_address": "0x5dA5C2a98e26FD28914b91212b1232D58eb9bbab",
            "amount": 0.000373,
            "order": 0,
            "amount_in_base_units": "373000000000000",
            "network": {
                "name": "ETHEREUM_SEPOLIA",
                "display_name": "Ethereum Sepolia",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
                "chain_id": "11155111",
                "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                "type": NetworkType.EVM,
                "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
                "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
                "token": {
                    "symbol": "ETH",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "metadata": {
                    "listing_date": "2023-12-27T16:46:50.617075+00:00"
                },
            },
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "fee_token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "call_data": "0x13e1",
            "fee": 18
        }
    ],
    "swap": {
        "exchange_account_connected": true,
        "source_address": "0x5f4025Cb72997D971e101a8FEf19422e696b4162",
        "id": "f9b0c0ca-3caa-483e-9bc2-36332b6972c1",
        "created_date": "2024-04-16T14:41:35.725954+00:00",
        "source_network": {
            "name": "ETHEREUM_SEPOLIA",
            "display_name": "Ethereum Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
            "chain_id": "11155111",
            "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00"
            },
            "deposit_methods": []
        },
        "source_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "source_exchange": undefined,
        "destination_network": {
            "name": "ARBITRUM_SEPOLIA",
            "display_name": "Arbitrum One Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/arbitrum_sepolia.png",
            "chain_id": "421614",
            "node_url": "https://arbitrum-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.arbiscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.arbiscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": "0x420000000000000000000000000000000000000F"
            },
            "deposit_methods": []
        },
        "destination_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "destination_exchange": undefined,
        "requested_amount": 0.000373,
        "destination_address": "0x5f4025cb72997d971e101a8fef19422e696b4162",
        "status": SwapStatus.Failed,
        "use_deposit_address": false,
        "metadata": {
            "sequence_number": 5089,
            "reference_id": "vmksv",
            "app": ""
        },
        "transactions": [
            {
                "from": "0x5f4025cb72997d971e101a8fef19422e696b4162",
                "to": "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
                "timestamp": "2024-04-16T14:41:48+00:00",
                "transaction_hash": "0xfa3f6a6c331a56c1bb4b8bde55d53ae75f26d2d17861951a56b78c125a138130",
                "confirmations": 3,
                "max_confirmations": 3,
                "amount": 0.000373,
                "type": TransactionType.Input,
                "status": BackendTransactionStatus.Failed,
                "created_date": "",
                "usd_price": 10,
                "usd_value": 10
            },
            {
                "amount": 0.000271,
                "confirmations": 15,
                "created_date": "2023-08-15T15:38:46.036437+00:00",
                "from": "0xe66aa98b55c5a55c9af9da12fe39b8868af9a346",
                "max_confirmations": 12,
                "to": "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
                "transaction_hash": "0x673d993640252bc40e7f69291a341deea2bb5250e8b13531b9e1412e326c5c42",
                "type": TransactionType.Refuel,
                "status": BackendTransactionStatus.Pending,
                "usd_price": 1840.02,
                "usd_value": 0.49864542,
            }
        ]
    },
    "quote": {
        "receive_amount": 0.000329,
        "min_receive_amount": 0.00032571,
        "blockchain_fee": 0.000012,
        "service_fee": 0.000032,
        "avg_completion_time": "00:00:47.5186220",
        "total_fee": 0.000044,
        "total_fee_in_usd": 0.13392588
    },
    "refuel": undefined,
}

export const cancelled: any = {
    "deposit_actions": [
        {
            "type": "transfer",
            "to_address": "0x5dA5C2a98e26FD28914b91212b1232D58eb9bbab",
            "amount": 0.000373,
            "order": 0,
            "amount_in_base_units": "373000000000000",
            "network": {
                "name": "ETHEREUM_SEPOLIA",
                "display_name": "Ethereum Sepolia",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
                "chain_id": "11155111",
                "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                "type": NetworkType.EVM,
                "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
                "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
                "token": {
                    "symbol": "ETH",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "metadata": {
                    "listing_date": "2023-12-27T16:46:50.617075+00:00"
                },
            },
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "fee_token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "call_data": "0x13e1",
            "fee": 18
        }
    ],
    "swap": {
        "exchange_account_connected": true,
        "source_address": "0x5f4025Cb72997D971e101a8FEf19422e696b4162",
        "id": "f9b0c0ca-3caa-483e-9bc2-36332b6972c1",
        "created_date": "2024-04-16T14:41:35.725954+00:00",
        "source_network": {
            "name": "ETHEREUM_SEPOLIA",
            "display_name": "Ethereum Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
            "chain_id": "11155111",
            "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00"
            },
            "deposit_methods": []
        },
        "source_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "source_exchange": undefined,
        "destination_network": {
            "name": "ARBITRUM_SEPOLIA",
            "display_name": "Arbitrum One Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/arbitrum_sepolia.png",
            "chain_id": "421614",
            "node_url": "https://arbitrum-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.arbiscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.arbiscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": "0x420000000000000000000000000000000000000F"
            },
            "deposit_methods": []
        },
        "destination_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "destination_exchange": undefined,
        "requested_amount": 0.000373,
        "destination_address": "0x5f4025cb72997d971e101a8fef19422e696b4162",
        "status": SwapStatus.Failed,
        "use_deposit_address": false,
        "metadata": {
            "sequence_number": 5089,
            "reference_id": "vmksv",
            "app": ""
        },
        "transactions": [

        ]
    },
    "quote": {
        "receive_amount": 0.000329,
        "min_receive_amount": 0.00032571,
        "blockchain_fee": 0.000012,
        "service_fee": 0.000032,
        "avg_completion_time": "00:00:47.5186220",
        "total_fee": 0.000044,
        "total_fee_in_usd": 0.13392588
    },
    "refuel": undefined,
}

export const expired: any = {
    "deposit_actions": [
        {
            "type": "transfer",
            "to_address": "0x5dA5C2a98e26FD28914b91212b1232D58eb9bbab",
            "amount": 0.000373,
            "order": 0,
            "amount_in_base_units": "373000000000000",
            "network": {
                "name": "ETHEREUM_SEPOLIA",
                "display_name": "Ethereum Sepolia",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
                "chain_id": "11155111",
                "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
                "type": NetworkType.EVM,
                "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
                "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
                "token": {
                    "symbol": "ETH",
                    "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                    "contract": null,
                    "decimals": 18,
                    "price_in_usd": 3043.77,
                    "precision": 6
                },
                "metadata": {
                    "listing_date": "2023-12-27T16:46:50.617075+00:00"
                },
            },
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "fee_token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "call_data": "0x13e1",
            "fee": 18
        }
    ],
    "swap": {
        "exchange_account_connected": true,
        "source_address": "0x5f4025Cb72997D971e101a8FEf19422e696b4162",
        "id": "f9b0c0ca-3caa-483e-9bc2-36332b6972c1",
        "created_date": "2024-04-16T14:41:35.725954+00:00",
        "source_network": {
            "name": "ETHEREUM_SEPOLIA",
            "display_name": "Ethereum Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/ethereum_sepolia.png",
            "chain_id": "11155111",
            "node_url": "https://eth-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.etherscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.etherscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00"
            },
            "deposit_methods": []
        },
        "source_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "source_exchange": undefined,
        "destination_network": {
            "name": "ARBITRUM_SEPOLIA",
            "display_name": "Arbitrum One Sepolia",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/networks/arbitrum_sepolia.png",
            "chain_id": "421614",
            "node_url": "https://arbitrum-sepolia.blastapi.io/84acb0b4-99f6-4a3d-9f63-15d71d9875ef",
            "type": NetworkType.EVM,
            "transaction_explorer_template": "https://sepolia.arbiscan.io/tx/{0}",
            "account_explorer_template": "https://sepolia.arbiscan.io/address/{0}",
            "token": {
                "symbol": "ETH",
                "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
                "contract": null,
                "decimals": 18,
                "price_in_usd": 3043.77,
                "precision": 6
            },
            "metadata": {
                "listing_date": "2023-12-27T16:46:50.617075+00:00",
                "evm_oracle_contract": "0x420000000000000000000000000000000000000F"
            },
            "deposit_methods": []
        },
        "destination_token": {
            "symbol": "ETH",
            "logo": "https://devlslayerswapbridgesa.blob.core.windows.net/layerswap/currencies/eth.png",
            "contract": null,
            "decimals": 18,
            "price_in_usd": 3043.77,
            "precision": 6
        },
        "destination_exchange": undefined,
        "requested_amount": 0.000373,
        "destination_address": "0x5f4025cb72997d971e101a8fef19422e696b4162",
        "status": SwapStatus.Failed,
        "use_deposit_address": false,
        "metadata": {
            "sequence_number": 5089,
            "reference_id": "vmksv",
            "app": ""
        },
        "transactions": [

        ]
    },
    "quote": {
        "receive_amount": 0.000329,
        "min_receive_amount": 0.00032571,
        "blockchain_fee": 0.000012,
        "service_fee": 0.000032,
        "avg_completion_time": "00:00:47.5186220",
        "total_fee": 0.000044,
        "total_fee_in_usd": 0.13392588
    },
    "refuel": undefined,
}