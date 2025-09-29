import { createConfig, http } from 'wagmi';
import { mainnet, sepolia } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

const projectId = 'your-project-id'; // TODO: Replace with actual WalletConnect project ID

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: 'Encrypted Potion Leaderboard',
        description: 'A gamified dApp for potion brewing with encrypted scoring',
        url: 'https://encrypted-potions.app',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});