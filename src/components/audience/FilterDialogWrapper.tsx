import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { X } from "lucide-react";

interface FilterDialogWrapperProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  children: React.ReactNode;
  onReset: () => void;
  onContinue: () => void;
}

export function FilterDialogWrapper({ open, onOpenChange, icon, title, description, children, onReset, onContinue }: FilterDialogWrapperProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            {icon}
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="py-4 space-y-6">
          {children}
        </div>
        <Separator />
        <DialogFooter className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={onReset}>Reset</Button>
          <Button onClick={onContinue}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
