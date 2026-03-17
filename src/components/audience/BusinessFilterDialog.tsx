import { FilterDialogWrapper } from "./FilterDialogWrapper";
import { TagInput } from "./TagInput";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";

export interface BusinessFilters {
  b2bKeywords: string[];
  jobTitles: string[];
  seniority: string;
  department: string;
  companyNames: string[];
  companyDomains: string[];
  industry: string;
}

const seniorityOptions = ["", "C-Level", "VP", "Director", "Manager", "Senior", "Entry Level"];
const departmentOptions = ["", "Engineering", "Sales", "Marketing", "Finance", "HR", "Operations", "Product", "Design"];
const industryOptions = ["", "Technology", "Healthcare", "Finance", "Real Estate", "Education", "Manufacturing", "Retail", "Construction"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: BusinessFilters;
  onChange: (filters: BusinessFilters) => void;
}

export function BusinessFilterDialog({ open, onOpenChange, filters, onChange }: Props) {
  const reset = () => onChange({ b2bKeywords: [], jobTitles: [], seniority: "", department: "", companyNames: [], companyDomains: [], industry: "" });

  return (
    <FilterDialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      icon={<Briefcase className="h-5 w-5" />}
      title="Business"
      description="What business characteristics does this audience represent?"
      onReset={reset}
      onContinue={() => onOpenChange(false)}
    >
      <div className="space-y-2">
        <Label className="font-semibold">B2B Business Keywords</Label>
        <TagInput tags={filters.b2bKeywords} onChange={v => onChange({ ...filters, b2bKeywords: v })} placeholder="Type and press enter..." />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Job Titles</Label>
        <TagInput tags={filters.jobTitles} onChange={v => onChange({ ...filters, jobTitles: v })} placeholder="Type and press enter..." />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Seniority</Label>
        <Select value={filters.seniority} onValueChange={v => onChange({ ...filters, seniority: v })}>
          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {seniorityOptions.map(o => <SelectItem key={o || "all"} value={o || "all"}>{o || "All"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Departments</Label>
        <Select value={filters.department} onValueChange={v => onChange({ ...filters, department: v })}>
          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {departmentOptions.map(o => <SelectItem key={o || "all"} value={o || "all"}>{o || "All"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Company Names</Label>
        <TagInput tags={filters.companyNames} onChange={v => onChange({ ...filters, companyNames: v })} placeholder="Type and press enter..." />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Company Domains</Label>
        <TagInput tags={filters.companyDomains} onChange={v => onChange({ ...filters, companyDomains: v })} placeholder="Type and press enter..." />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Industries</Label>
        <Select value={filters.industry} onValueChange={v => onChange({ ...filters, industry: v })}>
          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {industryOptions.map(o => <SelectItem key={o || "all"} value={o || "all"}>{o || "All"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>
    </FilterDialogWrapper>
  );
}
