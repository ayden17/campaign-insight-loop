import {
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
} from "recharts";
import { spendQualityData } from "@/lib/mock-data";

export function SpendQualityChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground">Spend vs Lead Quality</h3>
      <p className="text-[11px] text-muted-foreground mt-0.5 mb-5">Monthly spend compared to lead quality distribution</p>
      <div className="h-[280px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={spendQualityData} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="left" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis yAxisId="right" orientation="right" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
                fontSize: "12px",
                color: "hsl(var(--card-foreground))",
              }}
            />
            <Bar yAxisId="left" dataKey="highQuality" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} name="High Quality" />
            <Bar yAxisId="left" dataKey="lowQuality" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} name="Low Quality" opacity={0.7} />
            <Area yAxisId="right" type="monotone" dataKey="spend" stroke="hsl(var(--primary))" fill="hsl(var(--primary) / 0.08)" name="Spend ($)" strokeWidth={2} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
