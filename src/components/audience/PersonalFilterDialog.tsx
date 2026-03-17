import { useState } from "react";
import { FilterDialogWrapper } from "./FilterDialogWrapper";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { UserCheck, Plus, X } from "lucide-react";

export interface PersonalFilters {
  ageMin: string;
  ageMax: string;
  customFilters: { field: string; value: string }[];
}

const personalFields = ["Gender", "Education Level", "Marital Status", "Ethnicity", "Language", "Religion"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: PersonalFilters;
  onChange: (filters: PersonalFilters) => void;
}

export function PersonalFilterDialog({ open, onOpenChange, filters, onChange }: Props) {
  const [addOpen, setAddOpen] = useState(false);
  const [newField, setNewField] = useState("");
  const [newValue, setNewValue] = useState("");

  const reset = () => onChange({ ageMin: "", ageMax: "", customFilters: [] });

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
      icon={<UserCheck className="h-5 w-5" />}
      title="Personal"
      description="What are the personal characteristics of your audience?"
      onReset={reset}
      onContinue={() => onOpenChange(false)}
    >
      <div className="space-y-2">
        <Label className="font-semibold">Age Range</Label>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs text-muted-foreground">Min</Label>
            <Input placeholder="Enter minimum value" value={filters.ageMin} onChange={e => onChange({ ...filters, ageMin: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Max</Label>
            <Input placeholder="Enter maximum value" value={filters.ageMax} onChange={e => onChange({ ...filters, ageMax: e.target.value })} />
          </div>
        </div>
      </div>

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

      {/* Add Filter Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader><DialogTitle>Add Filter</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Field</Label>
              <Select value={newField} onValueChange={setNewField}>
                <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {personalFields.map(f => <SelectItem key={f} value={f}>{f}</SelectItem>)}
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
