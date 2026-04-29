import { useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ContextProvider } from "@juo/blocks/react";
import { setNavigateCallback } from "./lib/router";
import { LoginPage } from "./pages/LoginPage";
import { OrdersPage } from "./pages/OrdersPage";
import { HistoryPage } from "./pages/HistoryPage";
import { AktualnosciPage } from "./pages/AktualnosciPage";
import { AdresyPage } from "./pages/AdresyPage";
import { SubscriptionPage } from "./pages/SubscriptionPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function NavigateBridge() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigateCallback(navigate);
    return () => {
      setNavigateCallback(null);
    };
  }, [navigate]);
  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ContextProvider>
        <BrowserRouter>
          <NavigateBridge />
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<SubscriptionPage />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/aktualnosci" element={<AktualnosciPage />} />
            <Route path="/adresy" element={<AdresyPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ContextProvider>
    </QueryClientProvider>
  );
}

export function mountApp(container: HTMLElement): void {
  createRoot(container).render(<App />);
}
