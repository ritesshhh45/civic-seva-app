import { useState } from "react";
import { ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  src?: string | null;
  alt: string;
  /** Tailwind classes for the frame (size, radius, shadow). */
  className?: string;
  /** Where the subject sits inside the crop — faces usually want "top". */
  position?: "center" | "top";
  /** Rendered when there is no image or it fails to load. */
  fallback?: "icon" | "none";
  /** Above-the-fold images (hero, splash portrait, logo) load eagerly. */
  priority?: boolean;
};

export function resolveImageUrl(src?: string | null) {
  if (!src) return src ?? undefined;
  if (/^(https?:|data:|blob:)/i.test(src)) return src;
  if (src.startsWith("/__l5e/")) return undefined;
  return src;
}

/**
 * Every image in the app goes through this so nothing ever stretches, letterboxes
 * or shows a broken-image icon: the frame owns the shape, the photo is cropped
 * to fill it.
 */
export function AppImage({
  src,
  alt,
  className,
  position = "center",
  fallback = "icon",
  priority = false,
}: Props) {
  const [failed, setFailed] = useState(false);
  const url = resolveImageUrl(src);
  const ok = Boolean(url) && !failed;

  if (!ok && fallback === "none") return null;

  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {ok ? (
        <img
          src={url as string}
          alt={alt}
          loading={priority ? "eager" : "lazy"}
          decoding={priority ? "sync" : "async"}
          fetchPriority={priority ? "high" : undefined}
          onError={() => setFailed(true)}
          className={cn(
            "h-full w-full object-cover",
            position === "top" ? "object-top" : "object-center",
          )}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-muted-foreground/50">
          <ImageIcon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
}
