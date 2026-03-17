// Simple reactive store for Meta Ads connection state shared across pages
import { useCallback, useEffect, useState } from "react";

export interface AdAccount {
  id: string;
  name: string;
  account_status: number;
}

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  effective_status: string;
}

export interface CampaignInsights {
  campaign_id: string;
  impressions: string;
  clicks: string;
  spend: string;
}

let _accessToken: string | null = null;
let _adAccounts: AdAccount[] = [];
let _listeners: Array<() => void> = [];

function notify() {
  _listeners.forEach((l) => l());
}

export const metaAdsStore = {
  getAccessToken: () => _accessToken,
  getAdAccounts: () => _adAccounts,
  setAccessToken(token: string) {
    _accessToken = token;
    notify();
  },
  setAdAccounts(accounts: AdAccount[]) {
    _adAccounts = accounts;
    notify();
  },
  subscribe(listener: () => void) {
    _listeners.push(listener);
    return () => {
      _listeners = _listeners.filter((l) => l !== listener);
    };
  },
};

export function useMetaAdsStore() {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    return metaAdsStore.subscribe(() => forceUpdate((n) => n + 1));
  }, []);
  return {
    accessToken: metaAdsStore.getAccessToken(),
    adAccounts: metaAdsStore.getAdAccounts(),
  };
}

export const API_VERSION = "v25.0";

export function useCampaigns(adAccountId: string | null) {
  const { accessToken } = useMetaAdsStore();
  const [campaigns, setCampaigns] = useState<MetaCampaign[]>([]);
  const [insights, setInsights] = useState<Record<string, CampaignInsights>>({});
  const [loading, setLoading] = useState(false);

  const fetchCampaigns = useCallback(() => {
    if (!adAccountId || !accessToken || !window.FB) return;
    setLoading(true);
    setCampaigns([]);
    setInsights({});

    // Fetch campaigns
    window.FB.api(
      `/${adAccountId}/campaigns`,
      {
        fields: "name,objective,effective_status",
        effective_status: '["ACTIVE","PAUSED"]',
        access_token: accessToken,
      } as any,
      (res: any) => {
        if (res?.data) {
          setCampaigns(res.data);

          // Fetch insights for the account
          window.FB.api(
            `/${adAccountId}/insights`,
            {
              fields: "campaign_id,campaign_name,impressions,clicks,spend",
              level: "campaign",
              time_range: JSON.stringify({
                since: "2024-01-01",
                until: new Date().toISOString().split("T")[0],
              }),
              access_token: accessToken,
            } as any,
            (insightsRes: any) => {
              if (insightsRes?.data) {
                const map: Record<string, CampaignInsights> = {};
                insightsRes.data.forEach((d: any) => {
                  map[d.campaign_id] = d;
                });
                setInsights(map);
              }
              setLoading(false);
            }
          );
        } else {
          setLoading(false);
        }
      }
    );
  }, [adAccountId, accessToken]);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  return { campaigns, insights, loading, refetch: fetchCampaigns };
}
