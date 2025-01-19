import { useEffect } from "react";
import { passportInstance, initilizePassport } from "../components/WalletProviders/ImtblPassportProvider";
import { useRouter } from "next/router";

const ImtblRedirect = () => {
    const router = useRouter();

    useEffect(() => {
        (async () => {
            if (!passportInstance) await initilizePassport(router.basePath)
            passportInstance.loginCallback();
        })()
    }, [passportInstance])

    return (
        <div>
            <h1>Redirecting...</h1>
        </div>
    );
}

export default ImtblRedirect;