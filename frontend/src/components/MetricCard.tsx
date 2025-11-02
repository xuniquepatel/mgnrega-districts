import React from "react";
export default function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number | string | null | undefined;
}) {
  return (
    <div
      style={{
        padding: 12,
        border: "1px solid #eee",
        borderRadius: 12,
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 600 }}>
        {value == null ? "—" : value.toLocaleString?.() ?? value}
      </div>
    </div>
  );
}
