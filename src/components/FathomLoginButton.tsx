import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Headphones, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const FATHOM_CLIENT_ID = "_vwFnNmZjTDxSeVhK9ZbsghxGCZ1szhmZfPKiB88Xhk";
const REDIRECT_URI = window.location.origin + "/ad-accounts";

export function FathomLoginButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Check if already connected
  useEffect(() => {
    const checkConnection = async () => {
      const { data } = await supabase
        .from("fathom_connections")
        .select("id")
        .limit(1);
      if (data && data.length > 0) setConnected(true);
    };
    checkConnection();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    
    if (code && state) {
      setLoading(true);
      // Clean up URL
      window.history.replaceState({}, "", window.location.pathname);
      
      supabase.functions.invoke("fathom-auth", {
        body: { code, redirect_uri: REDIRECT_URI },
      }).then(({ data, error }) => {
        if (error) {
          console.error("Fathom auth error:", error);
          toast({ title: "Connection failed", description: "Could not connect to Fathom. Please try again.", variant: "destructive" });
        } else {
          setConnected(true);
          toast({ title: "Connected!", description: "Fathom account linked successfully." });
        }
        setLoading(false);
      });
    }
  }, [toast]);

  const handleConnect = useCallback(() => {
    const state = crypto.randomUUID();
    const authUrl = `https://fathom.video/external/v1/oauth2/authorize?client_id=${FATHOM_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=public_api&state=${state}`;
    window.location.href = authUrl;
  }, []);

  if (connected) {
    return (
      <div className="flex items-center gap-2 text-success">
        <CheckCircle className="h-4 w-4" />
        <span className="text-sm font-medium">Connected to Fathom</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleConnect}
        disabled={loading}
        className="gap-2"
        variant="outline"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Headphones className="h-4 w-4" />
        )}
        Connect Fathom
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Authorize Fathom to sync your sales call recordings and transcripts.
      </p>
    </div>
  );
}
