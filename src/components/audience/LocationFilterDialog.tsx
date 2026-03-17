import { FilterDialogWrapper } from "./FilterDialogWrapper";
import { TagInput } from "./TagInput";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin } from "lucide-react";

export interface LocationFilters {
  cities: string[];
  states: string[];
  zipCodes: string[];
  countryCode: string;
}

const usStates = ["", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: LocationFilters;
  onChange: (filters: LocationFilters) => void;
}

export function LocationFilterDialog({ open, onOpenChange, filters, onChange }: Props) {
  const reset = () => onChange({ cities: [], states: [], zipCodes: [], countryCode: "" });

  return (
    <FilterDialogWrapper
      open={open}
      onOpenChange={onOpenChange}
      icon={<MapPin className="h-5 w-5" />}
      title="Location"
      description="Where are they located?"
      onReset={reset}
      onContinue={() => onOpenChange(false)}
    >
      <div className="space-y-2">
        <Label className="font-semibold">Cities</Label>
        <TagInput tags={filters.cities} onChange={v => onChange({ ...filters, cities: v })} placeholder="Type to search..." />
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">States</Label>
        <Select value={filters.states[0] || ""} onValueChange={v => onChange({ ...filters, states: v && v !== "all" ? [v] : [] })}>
          <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
          <SelectContent>
            {usStates.map(s => <SelectItem key={s || "all"} value={s || "all"}>{s || "All"}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label className="font-semibold">Zip Codes</Label>
        <TagInput tags={filters.zipCodes} onChange={v => onChange({ ...filters, zipCodes: v })} placeholder="Type to search, or enter multiple zip codes separated by commas..." />
      </div>
    </FilterDialogWrapper>
  );
}
