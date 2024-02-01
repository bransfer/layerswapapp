import { SwapStatus } from "../../Models/SwapStatus"
import { SwapItem, TransactionStatus, TransactionType } from "../../lib/layerSwapApiClient"

export const swap: SwapItem = {
    "id": "39dbe478-5a7d-427c-b316-cc8c362ec010",
    "sequence_number": 2308,
    "requested_amount": 0.0015,
    "fee": 0.00057,
    "message": undefined,
    "reference_id": undefined,
    "app_name": "Layerswap",
    "has_pending_deposit": false,
    "exchange_account_connected": false,
    "created_date": "2023-08-16T16:31:11.934618+00:00",
    "status": SwapStatus.Created,
    "destination_address": "0x142c03fC8fd30d11Ed17eF0F48a9941fD4A66953",
    "source_network_asset": "ETH",
    "source_network": "ETHEREUM_GOERLI",
    "destination_network_asset": "ETH",
    "destination_network": "ARBITRUM_GOERLI",
    "has_refuel": true,
    "fail_reason": "",
    "transactions": [
        {
            "from": "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
            "to": "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
            "created_date": "2023-08-16T16:31:50.028165+00:00",
            "transaction_id": "0x40eb981625e69775664049fb930d489ff766a906c0528ffdb32715636d145962",
            "confirmations": 3,
            "max_confirmations": 3,
            "amount": 0.0015,
            "usd_price": 1819.02,
            "type": TransactionType.Input,
            "usd_value": 2.728530,
            "status": TransactionStatus.Pending,
        },
        {
            "from": "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
            "to": "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
            "created_date": "2023-08-16T16:33:23.4937+00:00",
            "transaction_id": "0xae9231b805139bee7e92ddae631b13bb2d13a09e106826b4f08e8efa965d1c27",
            "confirmations": 28,
            "max_confirmations": 12,
            "amount": 0.00093,
            "usd_price": 1819.02,
            "type": TransactionType.Output,
            "status": TransactionStatus.Pending,
            "usd_value": 1.6916886
        },
        {
            "amount": 0.000271,
            "confirmations": 15,
            "created_date": "2023-08-15T15:38:46.036437+00:00",
            "from": "0xe66aa98b55c5a55c9af9da12fe39b8868af9a346",
            "max_confirmations": 12,
            "to": "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
            "transaction_id": "0x673d993640252bc40e7f69291a341deea2bb5250e8b13531b9e1412e326c5c42",
            "type": TransactionType.Refuel,
            "usd_price": 1840.02,
            "usd_value": 0.49864542,
            "status": TransactionStatus.Pending,
        }
    ]
}

export const failedSwap: SwapItem = {
    "id": "9c68c265-c9d0-4b52-8e2a-bd309e565451",
    "sequence_number": 2571,
    "requested_amount": 0.0018,
    "fee": 0.00057,
    "message": undefined,
    "reference_id": undefined,
    "exchange_account_connected": false,
    "app_name": "Layerswap",
    "has_pending_deposit": false,
    "created_date": "2023-08-30T09:04:41.673486+00:00",
    "status": SwapStatus.Failed,
    "destination_address": "0x142c03fC8fd30d11Ed17eF0F48a9941fD4A66953",
    "source_network_asset": "ETH",
    "source_network": "ETHEREUM_GOERLI",
    "destination_network_asset": "ETH",
    "destination_network": "ARBITRUM_GOERLI",
    "has_refuel": false,
    "fail_reason": "",
    "transactions": [
        {
            "from": "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
            "to": "0x5da5c2a98e26fd28914b91212b1232d58eb9bbab",
            "created_date": "2023-08-30T09:07:34.213877+00:00",
            "transaction_id": "0x43b595400b4e61560846f87115f5b0273ae5f6f1a390f107dca722115a0cd2bf",
            "confirmations": 3,
            "max_confirmations": 3,
            "amount": 0.0018,
            "usd_price": 1718.42,
            "type": TransactionType.Input,
            "status": TransactionStatus.Pending,
            "usd_value": 3.093156
        },
    ]
}

export const failedSwapOutOfRange: SwapItem = {
    "id": "343a77b7-6a38-4918-9e10-866784b77d9f",
    "sequence_number": 2570,
    "requested_amount": 0.0015,
    "exchange_account_connected": false,
    "fee": 0.000633,
    "message": "Received amount 0.11 is higher of valid range 0.000633-0.1 swap Id 343a77b7-6a38-4918-9e10-866784b77d9f.",
    "reference_id": undefined,
    "app_name": "Layerswap",
    "has_pending_deposit": false,
    "created_date": "2023-08-29T14:16:02.389108+00:00",
    "status": SwapStatus.Failed,
    "destination_address": "0x142c03fC8fd30d11Ed17eF0F48a9941fD4A66953",
    "source_network_asset": "ETH",
    "source_network": "ETHEREUM_GOERLI",
    "destination_network_asset": "ETH",
    "destination_network": "ARBITRUM_GOERLI",
    "has_refuel": true,
    "fail_reason": "received_more_than_valid_range",
    "transactions": [
        {
            "from": "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
            "to": "0x21d35f8d47a20a9e652a8eb35ebcbffffa50059c",
            "created_date": "2023-08-29T14:17:14.689017+00:00",
            "transaction_id": "0x81677f514f897fd49f5d3fab1c6e09c13aa4613cd1a98749e0f3899cd331cd7a",
            "confirmations": 0,
            "max_confirmations": 3,
            "amount": 0.11,
            "usd_price": 1643.98,
            "type": TransactionType.Input,
            "status": TransactionStatus.Pending,
            "usd_value": 180.8378
        },
        {
            "amount": 0.000271,
            "confirmations": 15,
            "created_date": "2023-08-15T15:38:46.036437+00:00",
            "from": "0xe66aa98b55c5a55c9af9da12fe39b8868af9a346",
            "max_confirmations": 12,
            "to": "0x142c03fc8fd30d11ed17ef0f48a9941fd4a66953",
            "transaction_id": "0x673d993640252bc40e7f69291a341deea2bb5250e8b13531b9e1412e326c5c42",
            "type": TransactionType.Refuel,
            "status": TransactionStatus.Pending,
            "usd_price": 1840.02,
            "usd_value": 0.49864542,
        }
    ]
}

export const cancelled: SwapItem = {
    "id": "343a77b7-6a38-4918-9e10-866784b77d9f",
    "sequence_number": 2570,
    "requested_amount": 0.0015,
    "exchange_account_connected": false,
    "fee": 0.000633,
    "message": "",
    "reference_id": undefined,
    "app_name": "Layerswap",
    "has_pending_deposit": false,
    "created_date": "2023-08-29T14:16:02.389108+00:00",
    "status": SwapStatus.Cancelled,
    "destination_address": "0x142c03fC8fd30d11Ed17eF0F48a9941fD4A66953",
    "source_network_asset": "ETH",
    "source_network": "ETHEREUM_GOERLI",
    "destination_network_asset": "ETH",
    "destination_network": "ARBITRUM_GOERLI",
    "has_refuel": true,
    "fail_reason": "",
    "transactions": [
        
    ]
}

export const expired: SwapItem = {
    "id": "343a77b7-6a38-4918-9e10-866784b77d9f",
    "sequence_number": 2570,
    "requested_amount": 0.0015,
    "exchange_account_connected": false,
    "fee": 0.000633,
    "message": "",
    "reference_id": undefined,
    "app_name": "Layerswap",
    "has_pending_deposit": false,
    "created_date": "2023-08-29T14:16:02.389108+00:00",
    "status": SwapStatus.Expired,
    "destination_address": "0x142c03fC8fd30d11Ed17eF0F48a9941fD4A66953",
    "source_network_asset": "ETH",
    "source_network": "ETHEREUM_GOERLI",
    "destination_network_asset": "ETH",
    "destination_network": "ARBITRUM_GOERLI",
    "has_refuel": true,
    "fail_reason": "",
    "transactions": [
        
    ]
}