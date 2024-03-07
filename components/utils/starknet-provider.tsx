import React from "react";

import { sepolia, mainnet } from "@starknet-react/chains";
import {
    StarknetConfig,
    publicProvider,
    argent,
    braavos,
    useInjectedConnectors,
    voyager
} from "@starknet-react/core";
import ConnectStarknet from "../buttons/connectStarknet";
import { useStarknetStore } from "../../stores/starknetWithdrawStore";

export default function StarknetProvider({ children }) {
    const { openStarknetModal } = useStarknetStore()
    const { connectors } = useInjectedConnectors({
        recommended: [
            argent(),
            braavos(),
        ],
        includeRecommended: "onlyIfNoConnectors",
        order: "random"
    });

    return (
        <StarknetConfig
            chains={[mainnet, sepolia]}
            provider={publicProvider()}
            connectors={connectors}
            explorer={voyager}

        >
            {children}
            <ConnectStarknet openStarknetModal={openStarknetModal}>
                {children}
            </ConnectStarknet>
        </StarknetConfig>
    );
}