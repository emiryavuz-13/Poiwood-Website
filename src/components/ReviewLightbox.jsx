import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const ReviewLightbox = ({ images, startIndex, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);
  const [closing, setClosing] = useState(false);

  const handleClose = useCallback(() => {
    setClosing(true);
    setTimeout(() => onClose(), 200);
  }, [onClose]);

  const goTo = (dir) => {
    setCurrentIndex((prev) => {
      if (dir === 'prev') return prev === 0 ? images.length - 1 : prev - 1;
      return prev === images.length - 1 ? 0 : prev + 1;
    });
  };

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft') goTo('prev');
      if (e.key === 'ArrowRight') goTo('next');
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleClose]);

  return createPortal(
    <div className={`fixed inset-0 z-[100] ${closing ? 'animate-lightbox-out' : 'animate-lightbox-in'}`}>
      {/* Backdrop */}
      <div className={`fixed inset-0 bg-black/80 ${closing ? 'animate-fade-out' : 'animate-fade-in'}`} onClick={handleClose} />

      {/* Close button */}
      <button
        onClick={handleClose}
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-30 w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
      >
        <X className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Counter */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-30 text-white/70 text-sm font-medium">
        {currentIndex + 1} / {images.length}
      </div>

      {/* Main Image */}
      <div className="fixed inset-0 z-10 flex items-center justify-center px-14 sm:px-20 py-16 pointer-events-none">
        <img
          src={images[currentIndex].firebase_url}
          alt=""
          className="max-w-full max-h-full object-contain rounded-lg shadow-2xl pointer-events-auto"
        />
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => goTo('prev')}
            className="fixed left-2 sm:left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
          <button
            onClick={() => goTo('next')}
            className="fixed right-2 sm:right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all ${
                currentIndex === i ? 'border-white scale-110' : 'border-white/30 hover:border-white/60 opacity-70'
              }`}
            >
              <img src={img.firebase_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

export default ReviewLightbox;
