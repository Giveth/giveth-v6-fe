import { createThirdwebClient } from "thirdweb";
import {
    base,
    gnosis,
    mainnet,
    optimism,
    polygon,
    type Chain,
} from "thirdweb/chains";
import { createWallet, walletConnect, type Wallet } from "thirdweb/wallets";

import { env } from "@/lib/env";

export const supportedChains: Chain[] = [
    gnosis,
    mainnet,
    optimism,
    base,
    polygon,
];

const baseWallets: Wallet[] = [
    createWallet("io.metamask"),
    createWallet("com.coinbase.wallet"),
];

const walletConnectWallet = env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
    ? walletConnect()
    : undefined;

export const supportedWallets = walletConnectWallet
    ? [...baseWallets, walletConnectWallet]
    : baseWallets;

export const thirdwebClient = createThirdwebClient({
    clientId: env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID,
});

