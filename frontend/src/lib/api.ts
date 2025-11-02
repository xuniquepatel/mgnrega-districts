const API = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';
export async function getDistricts() {
  const r = await fetch(`${API}/districts?state=Gujarat`); return r.json();
}
export async function getMetrics(district: string) {
  const r = await fetch(`${API}/metrics?district=${encodeURIComponent(district)}`);
  return r.json();
}
export async function compare(district: string) {
  const r = await fetch(`${API}/compare?district=${encodeURIComponent(district)}`);
  return r.json();
}
export async function locate(lat: number, lon: number) {
  const r = await fetch(`${API}/geo/locate?lat=${lat}&lon=${lon}`);
  return r.json();
}