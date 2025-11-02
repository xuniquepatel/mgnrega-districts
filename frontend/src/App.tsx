import React, { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import { STRINGS, t, shortNum, speak, type Lang } from "./i18n";

type Metric = {
  state: string;
  district: string;
  fy: string;
  month: string; // ISO date
  persondaysTotal?: number | null;
  householdsWorked?: number | null;
  avgDaysPerHH?: number | null;
  womenPersondaysShare?: number | null;
  totalExpLakhs?: number | null;
  jobcardsTotal?: number | null;
  workersTotal?: number | null;
  createdAt?: string;
};

const API =
  (import.meta as any).env?.VITE_API_URL || "http://localhost:8080/api";

// tiny card component (inline to keep file self-contained)
function Card(props: React.PropsWithChildren<{ style?: React.CSSProperties }>) {
  return (
    <div className="card" style={props.style}>
      {props.children}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: any }) {
  return (
    <div className="card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value ?? "—"}</div>
    </div>
  );
}

export default function App() {
  const [lang, setLang] = useState<Lang>("en");
  const S = STRINGS[lang];

  const [online, setOnline] = useState<boolean>(navigator.onLine);
  useEffect(() => {
    const u = () => setOnline(navigator.onLine);
    window.addEventListener("online", u);
    window.addEventListener("offline", u);
    return () => {
      window.removeEventListener("online", u);
      window.removeEventListener("offline", u);
    };
  }, []);

  const [districts, setDistricts] = useState<string[]>([]);
  const [district, setDistrict] = useState<string>("");

  const [series, setSeries] = useState<Metric[]>([]);
  const latest = useMemo(() => {
    if (!series.length) return null;
    // last item is latest (API sorts in our backend)
    return series[series.length - 1];
  }, [series]);

  const [speakOn, setSpeakOn] = useState<boolean>(true);

  // load districts (once)
  useEffect(() => {
    (async () => {
      const url = `${API}/districts?state=Gujarat`;
      const r = await fetch(url);
      const j = await r.json();
      setDistricts(j?.districts || []);
      // if we had a last-used district in localStorage, use it
      const saved = localStorage.getItem("district");
      if (saved && j?.districts?.includes(saved)) setDistrict(saved);
    })();
  }, []);

  // load metrics when district changes
  useEffect(() => {
    if (!district) return;
    localStorage.setItem("district", district);
    (async () => {
      const url = `${API}/metrics?district=${encodeURIComponent(district)}`;
      const r = await fetch(url);
      const j = await r.json();
      setSeries(j?.metrics || []);
    })();
  }, [district]);

  // audio summary on change
  useEffect(() => {
    if (!speakOn || !latest) return;
    const parts: string[] = [];
    if (latest.householdsWorked != null)
      parts.push(
        `${shortNum(latest.householdsWorked, lang)} ${t(
          lang,
          "householdsWorked"
        )}`
      );
    if (latest.persondaysTotal != null)
      parts.push(
        `${shortNum(latest.persondaysTotal, lang)} ${t(lang, "persondays")}`
      );
    if (latest.avgDaysPerHH != null)
      parts.push(`${latest.avgDaysPerHH?.toFixed?.(1)} ${t(lang, "avgDays")}`);
    if (latest.womenPersondaysShare != null)
      parts.push(
        `${latest.womenPersondaysShare?.toFixed?.(1)}% ${t(lang, "womenShare")}`
      );
    if (parts.length) speak(parts.join(", "), lang);
  }, [lang, latest, speakOn]);

  // simple location→district hint (backend has a /api/geo/locate?lat&lon)
  async function useMyLocation() {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `${API}/geo/locate?lat=${latitude}&lon=${longitude}`;
      const r = await fetch(url);
      const j = await r.json();
      if (j?.district) setDistrict(j.district);
    });
  }

  return (
    <>
      <Header title={S.appTitle} />

      {/* status bar */}
      <div
        style={{
          background: "#fff",
          padding: "8px 12px",
          borderBottom: "1px solid #eee",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            gap: 10,
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
          }}
        >
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <select
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
            >
              <option value="">{t(lang, "pickDistrict")}</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <button onClick={useMyLocation}>{t(lang, "useMyLocation")}</button>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: online ? "#e7f9ed" : "#fde2e1",
              }}
            >
              {online ? t(lang, "online") : t(lang, "offline")}
            </span>
            <label
              style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
            >
              <input
                type="checkbox"
                checked={speakOn}
                onChange={(e) => setSpeakOn(e.target.checked)}
              />
              {t(lang, "speakToggle")}
            </label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Lang)}
            >
              <option value="en">ENGLISH</option>
              <option value="hi">हिंदी</option>
              <option value="gu">ગુજરાતી</option>
            </select>
          </div>
        </div>
      </div>

      {/* body */}
      <main className="container stack" style={{ marginTop: 12 }}>
        <Card>
          <h2 style={{ margin: "4px 0 8px" }}>
            {district || t(lang, "pickDistrict")}
          </h2>
          {latest && (
            <div style={{ color: "#5b6470" }}>
              {t(lang, "lastUpdated")}:{" "}
              {new Date(latest.createdAt || latest.month).toLocaleString()}
            </div>
          )}
        </Card>

        {/* metrics */}
        {latest && (
          <div className="grid">
            <MetricCard
              label={t(lang, "householdsWorked")}
              value={shortNum(latest.householdsWorked, lang)}
            />
            <MetricCard
              label={t(lang, "persondays")}
              value={shortNum(latest.persondaysTotal, lang)}
            />
            <MetricCard
              label={t(lang, "avgDays")}
              value={latest.avgDaysPerHH?.toFixed?.(1) ?? "—"}
            />
            <MetricCard
              label={t(lang, "womenShare")}
              value={
                latest.womenPersondaysShare != null
                  ? `${latest.womenPersondaysShare.toFixed(1)}%`
                  : "—"
              }
            />
            <MetricCard
              label={t(lang, "jobcards")}
              value={shortNum(latest.jobcardsTotal, lang)}
            />
            <MetricCard
              label={t(lang, "workers")}
              value={shortNum(latest.workersTotal, lang)}
            />
          </div>
        )}

        {!latest && (
          <Card>Pick a district to view its MGNREGA performance.</Card>
        )}
      </main>
    </>
  );
}
