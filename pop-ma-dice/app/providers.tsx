"use client";

import { type ReactNode } from "react";
import { base } from "wagmi/chains";
import { MiniKitProvider } from "@coinbase/onchainkit/minikit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { coinbaseWallet, metaMask, walletConnect } from "@wagmi/connectors";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// Create Wagmi config with multiple wallet connectors
const config = createConfig({
  chains: [base],
  connectors: [
    coinbaseWallet({
      appName: "Pop Ma Dice",
      appLogoUrl: process.env.NEXT_PUBLIC_ICON_URL || "/pop-ma-dice-logo.png",
    }),
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    }),
  ],
  transports: {
    [base.id]: http(process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org"),
  },
  ssr: true,
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

export function Providers(props: { children: ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <MiniKitProvider
          apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
          chain={base}
          config={{
            appearance: {
              mode: "auto",
              theme: "mini-app-theme",
              name: process.env.NEXT_PUBLIC_ONCHAINKIT_PROJECT_NAME || "Pop Ma Dice",
              logo: process.env.NEXT_PUBLIC_ICON_URL || "/pop-ma-dice-logo.png",
            },
          }}
        >
          {props.children}
        </MiniKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
