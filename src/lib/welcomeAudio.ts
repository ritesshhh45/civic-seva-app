/**
 * Plays the optional welcome voice clip exactly once per install.
 * Failures (missing file, autoplay blocked, unsupported codec) are swallowed —
 * the app never waits on audio.
 */
const KEY = "ws_welcome_audio_played";

export function preloadWelcomeAudio(url?: string | null) {
  if (!url) return null;
  try {
    if (localStorage.getItem(KEY)) return null;
    const audio = new Audio(url);
    audio.preload = "auto";
    audio.load();
    return audio;
  } catch {
    return null;
  }
}

export function playWelcomeAudioOnce(audio: HTMLAudioElement | null) {
  if (!audio) return;
  try {
    if (localStorage.getItem(KEY)) return;
    localStorage.setItem(KEY, "1");
    void audio.play().catch(() => {
      /* autoplay blocked — continue silently */
    });
  } catch {
    /* storage or playback unavailable — continue silently */
  }
}
