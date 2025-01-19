import React from 'react'
import { Head, Html, Main, NextScript } from 'next/document'

export enum TrackEvent {
  SignedIn = 'Signed in',
  SwapFailed = 'Swap failed',
  SwapInitiated = 'Swap initiated',
}

type PlausibleArgs = [TrackEvent, () => void] | [TrackEvent] | any

declare global {
  const plausible: {
    (...args: PlausibleArgs): void
    q?: PlausibleArgs[]
  }

  interface Window {
    plausible?: typeof plausible
  }
}

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <script
          defer
          data-domain='layerswap.io/v8'
          src="https://plausible.io/js/script.tagged-events.js"
        />
        <script
          defer
          data-domain='layerswap.io/v8'
          src="https://plausible.io/js/script.manual.js"
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'window.plausible = window.plausible || function() { (window.plausible.q = window.plausible.q || []).push(arguments) }',
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html:
              'if(typeof window !== "undefined" && !window.location.pathname.includes("nocookies")){try { localStorage.getItem("ls-ls-test"); }catch (e) { window.location.href = "/app/nocookies"; }}',
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}