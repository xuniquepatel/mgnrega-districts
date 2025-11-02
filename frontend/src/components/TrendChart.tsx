import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
export default function TrendChart({
  data,
  dataKey,
  label,
}: {
  data: any[];
  dataKey: string;
  label: string;
}) {
  const series = data.map((d: any) => ({
    x: new Date(d.month).toISOString().slice(0, 7),
    y: d[dataKey],
  }));
  return (
    <div
      style={{
        height: 240,
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 12,
      }}
    >
      <div style={{ fontSize: 14, marginBottom: 8 }}>{label}</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={series}>
          <XAxis dataKey="x" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Line type="monotone" dataKey="y" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
