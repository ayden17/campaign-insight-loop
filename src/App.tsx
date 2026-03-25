import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import ManagePixels from "./pages/ManagePixels";
import VisitorAnalytics from "./pages/VisitorAnalytics";
import AuthPage from "./pages/Auth";
import ResetPasswordPage from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import { useMetaSdkInit } from "./hooks/use-meta-sdk";

const queryClient = new QueryClient();

function ProtectedRoute() {
  const [session, setSession] = useState<null | "loading" | "authed" | "unauthed">("loading");

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s ? "authed" : "unauthed");
    });
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s ? "authed" : "unauthed");
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === "loading") return null;
  if (session === "unauthed") return <Navigate to="/auth" replace />;
  return <Outlet />;
}

const App = () => {
  useMetaSdkInit();
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<Index />} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/campaigns/:id" element={<CampaignDetail />} />
              <Route path="/ad-creatives" element={<AdCreatives />} />
              <Route path="/lead-search" element={<LeadSearch />} />
              <Route path="/pixels" element={<ManagePixels />} />
              <Route path="/visitor-analytics" element={<VisitorAnalytics />} />
              <Route path="/sync-audience" element={<FunnelView />} />
              <Route path="/funnel" element={<FunnelView />} />
              <Route path="/sales" element={<SalesConversations />} />
              <Route path="/leads" element={<LeadsPage />} />
              <Route path="/customers" element={<LeadsPage />} />
              <Route path="/intelligence" element={<IntelligencePage />} />
              <Route path="/ad-accounts" element={<AdAccountsPage />} />
              <Route path="/agent" element={<AgentPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
