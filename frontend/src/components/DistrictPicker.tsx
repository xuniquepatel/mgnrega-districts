import React from "react";
export default function DistrictPicker({
  districts,
  value,
  onChange,
}: {
  districts: any[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{ padding: 10, fontSize: 16, borderRadius: 8 }}
    >
      <option value="">-- Select --</option>
      {districts.map((d) => (
        <option key={d.id} value={d.name}>
          {d.name}
        </option>
      ))}
    </select>
  );
}
