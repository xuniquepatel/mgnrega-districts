export function speak(text: string) {
  try { const u = new SpeechSynthesisUtterance(text); window.speechSynthesis.speak(u); } catch {}
}