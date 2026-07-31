import { useEffect, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, X, PlayCircle } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { AppImage, resolveImageUrl } from "@/components/AppImage";
import { galleryQuery, type GalleryRow } from "@/lib/queries";
import { pick, useLang } from "@/lib/i18n";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery — Sanjay Chaudhary Ward Seva App" },
      { name: "description", content: "Photos and videos of development work and events in Ward No. 10." },
      { property: "og:title", content: "Gallery — Sanjay Chaudhary Ward Seva App" },
      { property: "og:description", content: "Photos of development work and events in Ward No. 10." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GalleryPage,
});

function GalleryPage() {
  const { t, lang } = useLang();
  const { data } = useQuery(galleryQuery);
  const [open, setOpen] = useState<number | null>(null);

  const photos = (data ?? []).filter((g) => g.media_type !== "video" && g.image_url);
  const videos = (data ?? []).filter((g) => g.media_type === "video");

  return (
    <AppLayout title={t("gallery")} back>
      {() => (
        <div className="space-y-6">
          {photos.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <div className="columns-2 gap-3 [column-fill:_balance]">
              {photos.map((g, i) => (
                <button
                  key={g.id}
                  onClick={() => setOpen(i)}
                  className="press mb-3 block w-full break-inside-avoid overflow-hidden rounded-3xl shadow-soft"
                >
                  <img
                    src={resolveImageUrl(g.image_url)}
                    alt={pick(lang, g.title_mr, g.title_en)}
                    loading="lazy"
                    className="w-full rounded-3xl object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {videos.length > 0 ? (
            <section>
              <h2 className="mb-3 text-base font-extrabold">{t("videos")}</h2>
              <div className="space-y-3">
                {videos.map((g) => (
                  <a
                    key={g.id}
                    href={g.video_url}
                    target="_blank"
                    rel="noreferrer"
                    className="press card-premium flex items-center gap-3 p-3"
                  >
                    {g.image_url ? (
                      <AppImage src={g.image_url} alt="" className="h-16 w-24 rounded-2xl" />
                    ) : (
                      <span className="flex h-16 w-24 items-center justify-center rounded-2xl bg-primary/12 text-primary">
                        <PlayCircle className="h-6 w-6" />
                      </span>
                    )}
                    <span className="text-sm font-bold">{pick(lang, g.title_mr, g.title_en)}</span>
                  </a>
                ))}
              </div>
            </section>
          ) : null}

          {open !== null ? (
            <Lightbox photos={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />
          ) : null}
        </div>
      )}
    </AppLayout>
  );
}

/** Full-screen viewer: swipe left/right between photos, pinch to zoom. */
function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: GalleryRow[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const { lang } = useLang();
  const [zoom, setZoom] = useState(1);
  const start = useRef<{ x: number; dist: number; zoom: number } | null>(null);

  useEffect(() => setZoom(1), [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onIndex(Math.min(index + 1, photos.length - 1));
      if (e.key === "ArrowLeft") onIndex(Math.max(index - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, photos.length, onClose, onIndex]);

  const dist = (t: TouchList) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const photo = photos[index];

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black/95">
      <div className="flex items-center justify-between px-4 pt-4 text-white">
        <span className="text-sm font-semibold">
          {index + 1} / {photos.length}
        </span>
        <button onClick={onClose} aria-label="Close" className="press rounded-full bg-white/12 p-2">
          <X className="h-5 w-5" />
        </button>
      </div>

      <div
        className="flex flex-1 items-center justify-center overflow-hidden px-2"
        onTouchStart={(e) => {
          start.current = {
            x: e.touches[0].clientX,
            dist: e.touches.length > 1 ? dist(e.touches) : 0,
            zoom,
          };
        }}
        onTouchMove={(e) => {
          const s = start.current;
          if (!s) return;
          if (e.touches.length > 1 && s.dist > 0) {
            const next = Math.min(4, Math.max(1, (s.zoom * dist(e.touches)) / s.dist));
            setZoom(next);
          }
        }}
        onTouchEnd={(e) => {
          const s = start.current;
          start.current = null;
          if (!s || s.dist > 0 || zoom > 1.05) return;
          const dx = e.changedTouches[0].clientX - s.x;
          if (dx < -50 && index < photos.length - 1) onIndex(index + 1);
          if (dx > 50 && index > 0) onIndex(index - 1);
        }}
      >
        <img
          src={resolveImageUrl(photo.image_url)}
          alt={pick(lang, photo.title_mr, photo.title_en)}
          style={{ transform: `scale(${zoom})` }}
          className="max-h-full max-w-full origin-center object-contain transition-transform duration-150"
        />
      </div>

      <div className="flex items-center justify-between gap-4 px-4 pb-8 pt-3 text-white">
        <button
          onClick={() => onIndex(Math.max(index - 1, 0))}
          disabled={index === 0}
          aria-label="Previous"
          className="press rounded-full bg-white/12 p-3 disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <p className="min-w-0 flex-1 truncate text-center text-sm">
          {pick(lang, photo.title_mr, photo.title_en)}
        </p>
        <button
          onClick={() => onIndex(Math.min(index + 1, photos.length - 1))}
          disabled={index === photos.length - 1}
          aria-label="Next"
          className="press rounded-full bg-white/12 p-3 disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
