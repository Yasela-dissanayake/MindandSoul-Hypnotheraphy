// Cover photos for courses and online packages.
// A cover is either a photo uploaded in the admin panel (a private storage key such as
// "covers/<id>/photo.jpg", served through /api/cover) or one of the website's own images
// in /public (a path such as "/reiki1.jpeg"), used as-is.

/** True for a website image path like "/reiki1.jpeg" (not an uploaded file). */
export function isSiteImage(key: string) {
  return /^\/[\w%.\-/]+\.(jpe?g|png|webp|avif|gif)$/i.test(key) && !key.includes("..");
}

/** The address to show a cover at, or null when there is none. */
export function coverUrl(kind: "course" | "package" | "session" | "promotion", item: { id: string; imageKey: string | null; updatedAt: Date }) {
  if (!item.imageKey) return null;
  if (isSiteImage(item.imageKey)) return item.imageKey;
  return `/api/cover/${kind}/${item.id}?v=${item.updatedAt.getTime()}`;
}
