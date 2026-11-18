"use client";

/**
 * Plays an uploaded video (Library item or a client's upload).
 * `src` is the app's /api/files/... address, which checks access and then hands the browser
 * a private storage link. Only the start of the video loads until play is pressed.
 */
export function VideoPlayer({ src, title }: { src: string; title: string }) {
  return (
    <video
      src={src}
      controls
      playsInline
      preload="metadata"
      controlsList="nodownload"
      onContextMenu={(e) => e.preventDefault()}
      aria-label={title}
      className="aspect-video w-full rounded-xl bg-stone-900"
    >
      Your browser can&apos;t play this video.
    </video>
  );
}
