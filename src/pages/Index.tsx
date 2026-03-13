import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Index = () => {
  return (
    <DashboardLayout title="Overview" subtitle="Ad performance & lead quality at a glance">
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Dashboard metrics will appear here once your data sources are connected.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Start by connecting your{" "}
          <a href="/ad-accounts" className="text-primary underline underline-offset-2 font-medium">Ad Accounts</a>
          {" "}and{" "}
          <a href="/sales" className="text-primary underline underline-offset-2 font-medium">Sales Conversations</a>.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default Index;
