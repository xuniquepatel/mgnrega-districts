const fs = require("fs");
const https = require("https");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const TARGET = path.join(DATA_DIR, "gujarat-districts.geojson");

const CANDIDATES = [
  "https://cdn.jsdelivr.net/gh/udit-001/india-maps-data/geojson/states/gujarat.geojson",
  "https://raw.githubusercontent.com/udit-001/india-maps-data/main/geojson/states/gujarat.geojson",
  "https://raw.githubusercontent.com/datta07/INDIAN-SHAPEFILES/master/INDIA/INDIA_DISTRICTS.geojson",
];

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        }
        let body = "";
        res.on("data", (d) => (body += d));
        res.on("end", () => resolve(body));
      })
      .on("error", reject);
  });
}

(async () => {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

    let text = null,
      used = null;
    for (const url of CANDIDATES) {
      try {
        text = await get(url);
        used = url;
        break;
      } catch (_) {}
    }
    if (!text) throw new Error("All sources failed");

    let geo = JSON.parse(text);

    const usedAllIndia = /INDIAN-SHAPEFILES.*INDIA_DISTRICTS\.geojson/i.test(
      used
    );
    if (usedAllIndia && Array.isArray(geo.features)) {
      geo.features = geo.features.filter((f) => {
        const st = (f.properties?.ST_NM || f.properties?.state_name || "")
          .toString()
          .toUpperCase();
        return st === "GUJARAT";
      });
      geo = { type: "FeatureCollection", features: geo.features };
    }

    if (
      !geo ||
      geo.type !== "FeatureCollection" ||
      !Array.isArray(geo.features) ||
      geo.features.length === 0
    ) {
      throw new Error("Downloaded GeoJSON looks invalid or empty");
    }

    fs.writeFileSync(TARGET, JSON.stringify(geo));
    console.log(
      "Saved:",
      TARGET,
      "from:",
      used,
      "features:",
      geo.features.length
    );
  } catch (err) {
    console.error("FAILED:", err.message);
    process.exit(1);
  }
})();
