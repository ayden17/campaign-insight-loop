import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OnboardingChecklist } from "@/components/dashboard/OnboardingChecklist";
import { AudienceListTable } from "@/components/dashboard/AudienceListTable";

const Index = () => {
  return (
    <DashboardLayout title="Overview" subtitle="Ad performance & lead quality at a glance">
      <OnboardingChecklist />
      <AudienceListTable />
    </DashboardLayout>
  );
};

export default Index;
