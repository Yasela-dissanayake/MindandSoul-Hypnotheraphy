"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Photos that slowly crossfade behind a hero section, with a dark overlay so white text stays readable.
 * Put it inside a `relative` section; the content goes on top with `relative z-10`.
 * Visitors who prefer less motion see the first photo only.
 */
export function HeroSlideshow({ images, interval = 6000 }: { images: { src: string; alt: string }[]; interval?: number }) {
  const [index, setIndex] = useState(0);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setStill(mq.matches);
    const onChange = () => setStill(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (still || images.length < 2) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [still, images.length, interval, index]); // `index` restarts the timer after a dot is clicked

  return (
    <div className="absolute inset-0">
      {images.map((img, i) => (
        <Image
          key={img.src}
          src={img.src}
          alt={img.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={cn(
            "object-cover transition-opacity duration-[1500ms] ease-in-out",
            i === index ? "opacity-100" : "opacity-0",
            !still && i === index && "animate-[heroZoom_12s_ease-out_forwards]",
          )}
        />
      ))}
      {/* Darker at the bottom and in the middle, so the heading and buttons are easy to read on any photo. */}
      <div className="absolute inset-0 bg-gradient-to-b from-stone-900/55 via-stone-900/45 to-stone-900/70" />
      {images.length > 1 && (
        <div className="absolute inset-x-0 bottom-5 z-10 flex justify-center gap-2">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show photo ${i + 1}: ${img.alt}`}
              aria-current={i === index}
              className={cn("h-2 rounded-full transition-all", i === index ? "w-6 bg-white" : "w-2 bg-white/50 hover:bg-white/80")}
            />
          ))}
        </div>
      )}
      <style>{`@keyframes heroZoom { from { transform: scale(1) } to { transform: scale(1.06) } }`}</style>
    </div>
  );
}
