"use client";
import React, { useEffect, useRef, useState } from "react";

interface CarouselProps {
  images: string[];
  interval?: number; // ms
}

export default function Carousel({ images, interval = 4000 }: CarouselProps) {
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const hoverRef = useRef(false);

  useEffect(() => {
    // start interval
    const start = () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      intervalRef.current = window.setInterval(() => {
        if (!hoverRef.current) setIndex((i) => (i + 1) % images.length);
      }, interval) as unknown as number;
    };

    if (images.length > 1) start();

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [images.length, interval]);

  const onDotClick = (i: number) => setIndex(i);

  return (
    <div
      className="w-full overflow-hidden rounded-md"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      aria-roledescription="carousel"
    >
      <div
        className="flex transition-transform duration-700 ease-in-out"
        style={{
          width: `${images.length * 100}%`,
          transform: `translateX(-${(index * 100) / images.length}%)`,
        }}
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="flex-shrink-0 flex items-center justify-center bg-gray-50"
            style={{ width: `${100 / images.length}%` }}
          >
            <div className="w-full h-48 sm:h-64 md:h-80 lg:h-96 flex items-center justify-center">
              <img
                src={src}
                alt={`slide-${i}`}
                className="max-w-full max-h-full object-contain"
                loading="lazy"
              />
            </div>
          </div>
        ))}
      </div>

      {/* dots */}
      <div className="flex items-center justify-center gap-2 mt-3">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => onDotClick(i)}
            aria-label={`Go to slide ${i + 1}`}
            className={`w-2 h-2 rounded-full ${
              i === index ? "bg-brand" : "bg-gray-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
