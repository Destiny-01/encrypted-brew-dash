import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

// TODO: Step 1 - Configure Wagmi with your WalletConnect Project ID
// 1. Get a free project ID from https://cloud.walletconnect.com/
// 2. Replace "your-project-id" with your actual project ID
// 3. Configure the chains you want to support (we're using Sepolia testnet)
const projectId = "your-project-id";

// TODO: Step 1 - Setup Wagmi Configuration
// This is the core configuration for wallet connection
// Documentation: https://wagmi.sh/react/getting-started
export const config = getDefaultConfig({
  appName: "Potion Brew",
  projectId, // TODO: Add your project ID here
  chains: [sepolia], // TODO: Configure your supported chains
  ssr: false,
});

/* ORIGINAL CODE FOR DOCUMENTATION:
import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

const projectId = "your-project-id";

export const config = getDefaultConfig({
  appName: "Potion Brew",
  projectId,
  chains: [sepolia],
  ssr: false,
});
*/
