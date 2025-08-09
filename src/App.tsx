import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { config } from '@/lib/web3';
import Index from "./pages/Index";
import History from "./pages/History";
import Leaderboard from "./pages/Leaderboard";
import NotFound from "./pages/NotFound";
import Badge from "./pages/Badge";
import { BackgroundGradientAnimationDemo } from "@/components/ui/demo";
import GradientMenu from "@/components/ui/gradient-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { GlobalMouseClickSound } from "@/components/GlobalMouseClickSound";

const queryClient = new QueryClient();

const App = () => {
  const isMobile = useIsMobile();
  return (
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={config}>
        <RainbowKitProvider 
          theme={darkTheme({
            accentColor: '#a855f7',
            accentColorForeground: 'white',
            borderRadius: 'large',
          })}
        >
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <GlobalMouseClickSound />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/history" element={<History />} />
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/demo" element={<BackgroundGradientAnimationDemo />} />
                <Route path="/badge" element={<Badge />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              {isMobile && <GradientMenu />}
            </BrowserRouter>
          </TooltipProvider>
        </RainbowKitProvider>
      </WagmiProvider>
    </QueryClientProvider>
  );
};

export default App;