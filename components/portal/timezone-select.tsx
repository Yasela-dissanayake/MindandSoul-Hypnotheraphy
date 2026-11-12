"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COMMON_TIMEZONES } from "@/lib/dates";

const label = (tz: string) => tz.replace(/_/g, " ").replace("/", " · ");

export function TimezoneSelect({ value, onChange }: { value: string; onChange: (tz: string) => void }) {
  const options = COMMON_TIMEZONES.includes(value) ? COMMON_TIMEZONES : [value, ...COMMON_TIMEZONES];
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-11">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((tz) => (
          <SelectItem key={tz} value={tz}>
            {label(tz)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
