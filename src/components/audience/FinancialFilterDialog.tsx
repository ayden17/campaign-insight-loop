import { useState } from "react";
import { FilterDialogWrapper } from "./FilterDialogWrapper";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { DollarSign, Plus, X } from "lucide-react";

export interface FinancialFilters {
  customFilters: { field: string; value: string }[];
}

const financialFields = [
  "Income Range", "Net Worth", "Credit Rating", "New Credit Range",
  "Credit Card User", "Investment", "Mortgage Amount", "Occupation Group",
  "Occupation Type", "SPA Code",
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FinancialFilters;
  onChange: (filters: FinancialFilters) => void;
}

export function FinancialFilterDialog({ open, onOpenChange, filters, onChange }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [newField, setNewField] = useState("");
  const [newValue, setNewValue] = useState("");

  const reset = () => onChange({ customFilters: [] });

  const addFilter = () => {
    if (newField && newValue) {
      onChange({ ...filters, customFilters: [...filters.customFilters, { field: newField, value: newValue }] });
      setNewField("");
      setNewValue("");
      setAddOpen(false);
    }
  };

  const removeFilter = (idx: number) => {
    onChange({ ...filters, customFilters: filters.customFilters.filter((_, i) => i !== idx) });
  };

  return (
    <FilterDialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      icon={<DollarSign className="h-5 w-5" />}
      title="Financial"
      description="What is your audience's financial profile?"
      onReset={reset}
      onContinue={() => onOpenChange(false)}
    >
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="font-semibold">Filters</Label>
          <Button size="sm" onClick={() => setAddOpen(true)} className="gap-1">
            Add <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="rounded-md border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs">Field</TableHead>
                <TableHead className="text-xs">Value</TableHead>
                <TableHead className="w-8" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filters.customFilters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground py-6">No filters added.</TableCell>
                </TableRow>
              ) : (
                filters.customFilters.map((f, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-sm">{f.field}</TableCell>
                    <TableCell className="text-sm">{f.value}</TableCell>
                    <TableCell>
                      <button onClick={() => removeFilter(i)} className="text-muted-foreground hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Add Filter</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Field</Label>
              <Select value={newField} onValueChange={setNewField}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {financialFields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Value</Label>
              <Input value={newValue} onChange={e => setNewValue(e.target.value)} placeholder="Enter value..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={addFilter}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </FilterDialogWrapper>
  );
}
