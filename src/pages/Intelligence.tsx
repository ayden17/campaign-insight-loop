import { DashboardLayout } from "@/components/layout/DashboardLayout";

const IntelligencePage = () => (
  <DashboardLayout title="Feedback Intelligence" subtitle="Close the loop between sales outcomes and ad spend">
    <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
      <p className="text-sm text-muted-foreground">
        Intelligence insights will populate once leads and campaign data are connected.
      </p>
    </div>
  </DashboardLayout>
);

export default IntelligencePage;
