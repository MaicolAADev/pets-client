"use client";
import { Galleria } from "primereact/galleria";
import { X } from "lucide-react";

export default function ImageModal({ images, activeImage, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="w-full h-full max-w-6xl flex items-center justify-center">
        <Galleria
          value={images}
          activeIndex={images.findIndex(img => img.itemImageSrc === activeImage)}
          style={{ width: "100%", height: "90%" }}
          showThumbnails={false}
          showItemNavigators
          showIndicators={images.length > 1}
          changeItemOnIndicatorHover
          circular
          item={(item) => (
            <div className="relative w-full h-full">
              <img
                src={item.itemImageSrc}
                alt={item.alt}
                className="w-full h-full object-contain"
              />
            </div>
          )}
          indicator={(index) => (
            <button className="w-3 h-3 mx-1 rounded-full bg-white/50 hover:bg-white transition" />
          )}
        />
      </div>
    </div>
  );
}