import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Headphones, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

interface FathomStatusResponse {
  connected: boolean;
  reason?: string | null;
}

export function FathomLoginButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  const validateConnection = useCallback(async (showCallbackToast = false) => {
    setChecking(true);
    try {
      const { data, error } = await supabase.functions.invoke("fathom-auth", {
        headers: { "Content-Type": "application/json" },
        body: { action: "status" },
      });

      if (error) throw error;

      const status = (data ?? {}) as FathomStatusResponse;
      const isConnected = !!status.connected;
      setConnected(isConnected);

      if (showCallbackToast) {
        toast({
          title: isConnected ? "Connected!" : "Authorization incomplete",
          description: isConnected
            ? "Fathom account linked successfully."
            : "Fathom still needs authorization. Please try connecting again.",
          variant: isConnected ? "default" : "destructive",
        });
      }
    } catch (err: any) {
      setConnected(false);
      if (showCallbackToast) {
        toast({
          title: "Connection check failed",
          description: err.message || "Could not verify your Fathom authorization.",
          variant: "destructive",
        });
      }
    } finally {
      setChecking(false);
    }
  }, [toast]);

  useEffect(() => {
    validateConnection(searchParams.get("fathom") === "connected");
  }, [searchParams, validateConnection]);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fathom-auth", {
        headers: { "Content-Type": "application/json" },
        body: { action: "start" },
      });
      if (error) throw error;
      if (data?.auth_url) {
        window.location.href = data.auth_url;
        return;
      }
      throw new Error("No authorization URL received");
    } catch (err: any) {
      console.error("Fathom auth error:", err);
      toast({
        title: "Connection failed",
        description: err.message || "Could not start Fathom OAuth flow.",
        variant: "destructive",
      });
      setLoading(false);
    }
  }, [toast]);

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
        disabled={loading || checking}
        className="gap-2"
        variant="outline"
      >
        {loading || checking ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Headphones className="h-4 w-4" />
        )}
        {checking ? "Checking Fathom" : "Connect Fathom"}
      </Button>
      <p className="text-[11px] text-muted-foreground">
        Authorize Fathom via OAuth to sync your sales call recordings and transcripts.
      </p>
    </div>
  );
}
