import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Headphones, Loader2, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "react-router-dom";

export function FathomLoginButton() {
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check if we just came back from OAuth callback
    if (searchParams.get("fathom") === "connected") {
      setConnected(true);
      toast({ title: "Connected!", description: "Fathom account linked successfully." });
      return;
    }

    const checkConnection = async () => {
      const { data } = await supabase
        .from("fathom_connections")
        .select("id")
        .limit(1);
      if (data && data.length > 0) setConnected(true);
    };
    checkConnection();
  }, [searchParams, toast]);

  const handleConnect = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("fathom-auth", {
        headers: { "Content-Type": "application/json" },
        body: {},
      });
      if (error) throw error;
      if (data?.auth_url) {
        // Redirect the user to Fathom's OAuth page
        window.location.href = data.auth_url;
      } else {
        throw new Error("No authorization URL received");
      }
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
        Authorize Fathom via OAuth to sync your sales call recordings and transcripts.
      </p>
    </div>
  );
}
