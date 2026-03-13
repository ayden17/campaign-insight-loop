import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Campaigns from "./pages/Campaigns";
import CampaignDetail from "./pages/CampaignDetail";
import FunnelView from "./pages/FunnelView";
import LeadsPage from "./pages/LeadFeedback";
import IntelligencePage from "./pages/Intelligence";
import AdAccountsPage from "./pages/AdAccounts";
import SalesConversations from "./pages/SalesConversations";
import AdCreatives from "./pages/AdCreatives";
import AgentPage from "./pages/Agent";
import SettingsPage from "./pages/Settings";
import LeadSearch from "./pages/LeadSearch";
import NotFound from "./pages/NotFound";
import { useMetaSdkInit } from "./hooks/use-meta-sdk";

const queryClient = new QueryClient();

const App = () => {
  useMetaSdkInit();
  return (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/campaigns/:id" element={<CampaignDetail />} />
          <Route path="/ad-creatives" element={<AdCreatives />} />
          <Route path="/lead-search" element={<LeadSearch />} />
          <Route path="/funnel" element={<FunnelView />} />
          <Route path="/sales" element={<SalesConversations />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/intelligence" element={<IntelligencePage />} />
          <Route path="/ad-accounts" element={<AdAccountsPage />} />
          <Route path="/agent" element={<AgentPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  );
};

export default App;
