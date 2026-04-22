import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { LiveLeadsTable } from "@/components/dashboard/LiveLeadsTable";

const Index = () => {
  return (
    <DashboardLayout title="Overview" subtitle="Ad performance & lead quality at a glance">
      <LiveLeadsTable />
      <OnboardingChecklist />
    </DashboardLayout>
  );
};

export default Index;
