import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { CreateCampaignDialog } from "@/components/dashboard/CreateCampaignDialog";
import { useMetaAdsStore, useCampaigns } from "@/lib/meta-ads-store";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Database, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Campaigns = () => {
  const { adAccounts, accessToken } = useMetaAdsStore();
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const { campaigns, insights, loading, refetch } = useCampaigns(selectedAccount);
  const navigate = useNavigate();

  const notConnected = !accessToken || adAccounts.length === 0;

  return (
    <DashboardLayout title="Campaigns" subtitle="Deep dive into ad performance">
      {/* Ad Account Breadcrumb Selector */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/campaigns">Ad Account</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {notConnected ? (
                <span className="text-sm text-muted-foreground">No accounts connected</span>
              ) : (
                <Select
                  value={selectedAccount ?? ""}
                  onValueChange={(val) => setSelectedAccount(val)}
                >
                  <SelectTrigger className="w-[240px]">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-muted-foreground/80" />
                      <SelectValue placeholder="Select ad account" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {adAccounts.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id}>
                        {acc.name || acc.id}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {notConnected && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-card-foreground mb-1">No Ad Account Connected</p>
          <p className="text-xs text-muted-foreground mb-4">
            Connect your Meta Ads account first to view campaigns.
          </p>
          <button
            onClick={() => navigate("/ad-accounts")}
            className="text-xs font-medium text-primary underline underline-offset-2 hover:text-primary/80"
          >
            Go to Ad Accounts →
          </button>
        </div>
      )}

      {!notConnected && !selectedAccount && (
        <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
          <Database className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-card-foreground">Select an Ad Account</p>
          <p className="text-xs text-muted-foreground mt-1">
            Choose an ad account from the dropdown above to load campaigns.
          </p>
        </div>
      )}

      {selectedAccount && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <CreateCampaignDialog
              adAccountId={selectedAccount}
              accessToken={accessToken!}
              onCreated={() => refetch()}
            />
          </div>
          <CampaignTable
            metaCampaigns={campaigns}
            metaInsights={insights}
            loading={loading}
          />
        </div>
      )}
    </DashboardLayout>
  );
};

export default Campaigns;
