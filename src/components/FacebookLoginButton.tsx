import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Link2, Loader2, CheckCircle } from "lucide-react";
import { metaAdsStore, useMetaAdsStore } from "@/lib/meta-ads-store";

declare global {
  interface Window {
    fbAsyncInit: () => void;
    FB: {
      init: (params: { appId: string; cookie: boolean; xfbml: boolean; version: string }) => void;
      getLoginStatus: (callback: (response: { status: string; authResponse?: { accessToken: string; userID: string } }) => void) => void;
      login: (
        callback: (response: { authResponse?: { accessToken: string; userID: string } }) => void,
        options: { scope: string; auth_type: string }
      ) => void;
      api: (
        path: string,
        params: { fields: string; access_token: string },
        callback: (response: { data?: Array<{ id: string; name: string; account_status: number }> }) => void
      ) => void;
    };
  }
}

const CONFIG_ID = "1968010944098901";

export function FacebookLoginButton() {
  const { accessToken, adAccounts } = useMetaAdsStore();
  const [loading, setLoading] = useState(false);

  const connected = !!accessToken;

  const handleLogin = useCallback(() => {
    if (!window.FB) return;
    setLoading(true);

    window.FB.login(
      (response) => {
        if (response.authResponse) {
          const token = response.authResponse.accessToken;
          metaAdsStore.setAccessToken(token);
          window.FB.api(
            "/me/adaccounts",
            { fields: "id,name,account_status", access_token: token },
            (res) => {
              if (res.data) {
                metaAdsStore.setAdAccounts(res.data);
              }
            }
          );
        } else {
          console.log("User cancelled Meta login.");
        }
        setLoading(false);
      },
      { config_id: CONFIG_ID, override_default_response_type: true } as any
    );
  }, []);

  if (connected) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-success">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm font-medium">Connected to Meta Ads</span>
        </div>
        {adAccounts.length > 0 && (
          <div className="space-y-2">
            {adAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="text-sm font-medium text-card-foreground">{acc.name}</p>
                  <p className="text-[11px] text-muted-foreground font-mono">{acc.id}</p>
                </div>
                <span className="text-[10px] font-medium text-success">Active</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleLogin}
        disabled={!window.FB || loading}
        className="gap-2"
        variant="outline"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        Connect Meta Ads
      </Button>
      <p className="text-[11px] text-muted-foreground">
        You must have a <span className="font-medium text-card-foreground">Meta Business Account</span> to connect and manage your ads.
      </p>
    </div>
  );
}
