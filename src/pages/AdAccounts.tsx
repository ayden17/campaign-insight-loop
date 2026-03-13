import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FacebookLoginButton } from "@/components/FacebookLoginButton";
import { FathomLoginButton } from "@/components/FathomLoginButton";
import metaLogo from "@/assets/meta-logo.png";
import fathomLogo from "@/assets/fathom-logo.png";
import googleAdsLogo from "@/assets/google-ads-logo.png";
import zillowLogo from "@/assets/zillow-logo.png";
import redfinLogo from "@/assets/redfin-logo.jpg";

const AdAccountsPage = () => (
  <DashboardLayout title="Ad Accounts" subtitle="Connect and manage your advertising platforms">
    <div className="max-w-2xl space-y-6">
      {/* Meta Ads */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={metaLogo} alt="Meta" className="h-10 w-10 rounded-xl object-contain" />
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Meta Ads</h3>
            <p className="text-[11px] text-muted-foreground">Connect via Facebook Login to pull campaigns, ad sets, and spend data</p>
          </div>
        </div>
        <FacebookLoginButton />
      </div>

      {/* Fathom */}
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <img src={fathomLogo} alt="Fathom" className="h-10 w-10 rounded-xl object-contain" />
          <div>
            <h3 className="text-sm font-semibold text-card-foreground">Fathom</h3>
            <p className="text-[11px] text-muted-foreground">
              AI-powered call assistant for lead enrichment and automated follow-ups.
            </p>
          </div>
        </div>
        <FathomLoginButton />
      </div>

      {/* Google Ads - Coming Soon */}
      <div className="rounded-xl border border-border bg-card p-6 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={googleAdsLogo} alt="Google Ads" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Google Ads</h3>
              <p className="text-[11px] text-muted-foreground">Google Ads integration coming soon</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground rounded-lg border border-border px-3 py-1">Coming Soon</span>
        </div>
      </div>

      {/* Zillow - Coming Soon */}
      <div className="rounded-xl border border-border bg-card p-6 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={zillowLogo} alt="Zillow" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Zillow</h3>
              <p className="text-[11px] text-muted-foreground">Zillow integration coming soon</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground rounded-lg border border-border px-3 py-1">Coming Soon</span>
        </div>
      </div>

      {/* Redfin - Coming Soon */}
      <div className="rounded-xl border border-border bg-card p-6 opacity-60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={redfinLogo} alt="Redfin" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <h3 className="text-sm font-semibold text-card-foreground">Redfin</h3>
              <p className="text-[11px] text-muted-foreground">Redfin integration coming soon</p>
            </div>
          </div>
          <span className="text-[11px] font-medium text-muted-foreground rounded-lg border border-border px-3 py-1">Coming Soon</span>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5">
        <p className="text-xs text-muted-foreground leading-relaxed">
          Connecting an ad account allows AdLoop to pull campaign performance data, spend metrics, and conversion events.
          Your access tokens are stored securely server-side and are never exposed in the frontend.
        </p>
      </div>
    </div>
  </DashboardLayout>
);

export default AdAccountsPage;
