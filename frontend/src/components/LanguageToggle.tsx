import React from "react";
export default function LanguageToggle({
  lang,
  setLang,
}: {
  lang: string;
  setLang: (l: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {["en", "hi", "gu"].map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          style={{
            padding: "6px 10px",
            borderRadius: 8,
            border: l === lang ? "2px solid #333" : "1px solid #ccc",
          }}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
