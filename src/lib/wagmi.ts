import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { sepolia } from "wagmi/chains";

const projectId = "your-project-id";

export const config = getDefaultConfig({
  appName: "Potion Brew",
  projectId,
  chains: [sepolia],
  ssr: false,
});
