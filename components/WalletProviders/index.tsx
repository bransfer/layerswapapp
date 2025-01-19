import { FC } from "react"
import TonConnectProvider from "./TonConnectProvider"
import SolanaProvider from "./SolanaProvider"
import { ThemeData } from "../../Models/Theme"
import Wagmi from "./Wagmi";
import StarknetProvider from "./StarknetProvider";
import { ImtblPassportProvider } from "./ImtblPassportProvider";

const WalletsProviders: FC<{ children: JSX.Element | JSX.Element[], basePath: string, themeData: ThemeData, appName: string | undefined }> = ({ children, basePath, themeData, appName }) => {
    return (
        <TonConnectProvider basePath={basePath} themeData={themeData} appName={appName}>
            <SolanaProvider>
                <StarknetProvider>
                    <Wagmi>
                        <ImtblPassportProvider>
                            {children}
                        </ImtblPassportProvider>
                    </Wagmi>
                </StarknetProvider>
            </SolanaProvider>
        </TonConnectProvider>
    )
}

export default WalletsProviders