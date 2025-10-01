import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { config } from "./lib/wagmi";
import { Landing } from "./pages/Landing";
import { Game } from "./pages/Game";
import NotFound from "./pages/NotFound";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import "@rainbow-me/rainbowkit/styles.css";
import { useEffect, useState } from "react";
import { initializeFHE } from "./lib/fhe";

const queryClient = new QueryClient();

/**
 * TODO: Step 4 - Initialize FHE on App Mount
 * The FHE SDK must be initialized before any encryption operations
 * 1. Call initializeFHE() in useEffect on mount
 * 2. Show loading state while initializing
 * 3. Handle initialization errors
 * 4. Only render app once FHE is ready
 */
const App = () => {
  // TODO: Remove this mock - Initialize FHE properly
  const [fheReady, setFheReady] = useState(true); // Set to true for now to allow app to load

  /* TODO: Uncomment and implement when ready
  useEffect(() => {
    initializeFHE()
      .then(() => {
        console.log("FHE initialized successfully");
        setFheReady(true);
      })
      .catch((err) => {
        console.error("Failed to initialize FHE:", err);
      });
  }, []);

  if (!fheReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-magic-purple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing encryption...</p>
        </div>
      </div>
    );
  }
  */

  /* ORIGINAL CODE FOR DOCUMENTATION:
  const [fheReady, setFheReady] = useState(false);

  useEffect(() => {
    initializeFHE()
      .then(() => {
        console.log("FHE initialized successfully");
        setFheReady(true);
      })
      .catch((err) => {
        console.error("Failed to initialize FHE:", err);
      });
  }, []);

  if (!fheReady) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-magic-purple mx-auto mb-4"></div>
          <p className="text-muted-foreground">Initializing encryption...</p>
        </div>
      </div>
    );
  }
  */

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/game" element={<Game />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
