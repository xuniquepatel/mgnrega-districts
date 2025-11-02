import React from "react";
export default function CompareStrip({
  district,
  stateAvg,
}: {
  district: any;
  stateAvg: any;
}) {
  const item = (label: string, d: any, s: any) => (
    <div style={{ flex: 1, padding: 12 }}>
      <div style={{ fontSize: 12, color: "#666" }}>{label}</div>
      <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
        <div>
          <b>{d == null ? "—" : Number(d).toLocaleString()}</b>{" "}
          <span style={{ fontSize: 12, color: "#666" }}>district</span>
        </div>
        <div style={{ color: "#999" }}>|</div>
        <div>
          {s == null ? "—" : Number(s).toLocaleString()}{" "}
          <span style={{ fontSize: 12, color: "#666" }}>state avg</span>
        </div>
      </div>
    </div>
  );
  return (
    <div
      style={{ display: "flex", border: "1px solid #eee", borderRadius: 12 }}
    >
      {item(
        "Person-days",
        district?.persondaysTotal,
        stateAvg?.persondaysTotal
      )}
      {item(
        "HH worked",
        district?.householdsWorked,
        stateAvg?.householdsWorked
      )}
      {item("Avg days/HH", district?.avgDaysPerHH, stateAvg?.avgDaysPerHH)}
      {item(
        "Women %",
        district?.womenPersondaysShare,
        stateAvg?.womenPersondaysShare
      )}
    </div>
  );
}
