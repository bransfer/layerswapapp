import { useEffect } from "react"
import { useRouter } from "next/router";

const PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_IMMUTABLE_PUBLISHABLE_KEY;
const CLIENT_ID = process.env.NEXT_PUBLIC_IMMUTABLE_CLIENT_ID;

export const initilizePassport = async (basePath: string) => {
    const passport = (await import('@imtbl/sdk')).passport
    const config = (await import('@imtbl/sdk')).config
    const redirectUri = basePath ? `${window.location.origin}${basePath}/imtblRedirect` : `${window.location.origin}/imtblRedirect`
    const logoutRedirectUri = basePath ? `${window.location.origin}${basePath}/` : `${window.location.origin}/`

    if (PUBLISHABLE_KEY && CLIENT_ID) {
        passportInstance = new passport.Passport({
            baseConfig: {
                environment: config.Environment.PRODUCTION,
                publishableKey: PUBLISHABLE_KEY,
            },
            clientId: CLIENT_ID,
            audience: 'platform_api',
            scope: 'openid offline_access email transact',
            redirectUri,
            logoutRedirectUri,
            logoutMode: 'silent',
        });
    }
}

export var passportInstance: any = undefined

export function ImtblPassportProvider({ children }: { children: JSX.Element | JSX.Element[] }) {
    const router = useRouter();

    useEffect(() => {
        if (!passportInstance) {
            (async () => {
                await initilizePassport(router.basePath)
                passportInstance?.connectEvm() && passportInstance.connectEvm() // EIP-6963
            })()
        }
    }, [passportInstance])

    return (
        <>
            {children}
        </>
    )
}