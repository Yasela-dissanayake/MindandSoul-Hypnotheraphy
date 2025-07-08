"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ServiceImageSliderProps {
  images: {
    src: string;
    alt: string;
  }[];
  interval?: number;
}

export function ServiceImageSlider({
  images,
  interval = 5000,
}: ServiceImageSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate through images
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, interval);

    return () => clearInterval(timer);
  }, [images.length, interval]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrevious = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length
    );
  };

  return (
    <div className="relative w-[full] h-[600px] overflow-hidden rounded-xl">
      {/* Images */}
      {images.map((image, index) => (
        <div
          key={index}
          className={cn(
            "absolute inset-0 w-[full] h-full transition-opacity duration-1000",
            index === currentIndex ? "opacity-100" : "opacity-0"
          )}
        >
          <Image
            src={image.src || "/placeholder.svg"}
            alt={image.alt}
            fill
            className="object-contain"
            priority={index === 0}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30" />
        </div>
      ))}

      {/* Navigation buttons */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 backdrop-blur-sm z-10"
        aria-label="Previous image"
      >
        <ChevronLeft className="h-6 w-6 text-stone-800" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 backdrop-blur-sm z-10"
        aria-label="Next image"
      >
        <ChevronRight className="h-6 w-6 text-stone-800" />
      </button>

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={cn(
              "w-2 h-2 rounded-full transition-all",
              index === currentIndex ? "bg-white w-6" : "bg-white/60"
            )}
            aria-label={`Go to image ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
