import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <DashboardLayout
      title={`Campaign ${id}`}
      subtitle="Campaign details"
      actions={
        <Button variant="ghost" size="sm" onClick={() => navigate("/campaigns")} className="gap-1.5">
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Button>
      }
    >
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-12 text-center">
        <p className="text-sm text-muted-foreground">
          Detailed campaign analytics will appear here once live data is connected.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default CampaignDetail;
