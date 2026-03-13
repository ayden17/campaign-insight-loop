import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { VideoUploadCard } from "@/components/ui/video-upload-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Image as ImageIcon } from "lucide-react";

const AdCreatives = () => {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <DashboardLayout title="Ad Creatives" subtitle="Upload and manage your ad creative assets">
      <div className="space-y-6">
        <VideoUploadCard
          title="Upload Ad Creative"
          description="Drag & drop your video or image ad creatives here, or click to browse."
          onFileSelect={(file) => setFiles((prev) => [...prev, file])}
        />

        {files.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                Uploaded Creatives ({files.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {files.map((f, i) => (
                  <div key={i} className="rounded-lg border border-border bg-muted/30 p-3">
                    <p className="text-xs font-medium text-card-foreground truncate">{f.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{(f.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {files.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-muted/30 p-8 text-center">
            <Palette className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium text-card-foreground">No creatives uploaded yet</p>
            <p className="text-xs text-muted-foreground mt-1">Upload your first ad creative to get started.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdCreatives;
