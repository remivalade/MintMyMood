import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { inject } from '@vercel/analytics';
import App from './App.tsx';
import { wagmiConfig } from './config/wagmi';
import { PreviewChainProvider } from './context/PreviewChainContext';

// Import styles
import './index.css';
import '@rainbow-me/rainbowkit/styles.css';

// Enable Vercel Web Analytics
inject();

// Create React Query client
const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider>
            <PreviewChainProvider>
              <App />
            </PreviewChainProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </StrictMode>
);
