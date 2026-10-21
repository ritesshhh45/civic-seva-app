// Free Marathi -> English translation for the admin panel (MyMemory API).
// Never throws: on any failure it returns the original text so publishing is never blocked.

const CONTACT_EMAIL = "ritesshhh19@gmail.com"; // raises the free daily limit

function chunkText(text: string, max = 140): string[] {
  // MyMemory allows ~500 bytes per request; Marathi is 3 bytes/char, so keep chunks short.
  const sentences = text.split(/(?<=[.!?।\n])\s+/).filter(Boolean);
  const chunks: string[] = [];
  let cur = "";
  const push = () => {
    if (cur.trim()) chunks.push(cur.trim());
    cur = "";
  };
  for (const s of sentences) {
    if (s.length > max) {
      push();
      let part = "";
      for (const w of s.split(/\s+/)) {
        if ((part + " " + w).length > max) {
          if (part.trim()) chunks.push(part.trim());
          part = w;
        } else {
          part += " " + w;
        }
      }
      if (part.trim()) chunks.push(part.trim());
    } else if ((cur + " " + s).length > max) {
      push();
      cur = s;
    } else {
      cur += " " + s;
    }
  }
  push();
  return chunks;
}

async function translateChunk(q: string): Promise<string> {
  const url =
    "https://api.mymemory.translated.net/get?q=" +
    encodeURIComponent(q) +
    "&langpair=mr|en&de=" +
    encodeURIComponent(CONTACT_EMAIL);
  const res = await fetch(url);
  if (!res.ok) throw new Error("translate http " + res.status);
  const json = await res.json();
  const out = String(json?.responseData?.translatedText ?? "").trim();
  if (!out || /QUERY LENGTH LIMIT|MYMEMORY WARNING/i.test(out)) throw new Error("translate failed");
  return out;
}

export async function translateMrToEn(text: string): Promise<string> {
  const src = (text ?? "").trim();
  if (!src) return "";
  try {
    const parts: string[] = [];
    for (const c of chunkText(src)) parts.push(await translateChunk(c));
    return parts.join(" ");
  } catch {
    return src; // fallback: keep Marathi so the update still publishes
  }
}