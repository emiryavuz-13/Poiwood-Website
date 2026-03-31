import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

const StoryViewer = ({ groups, initialGroupIndex = 0, onClose }) => {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef(null);
  const touchStartRef = useRef({ x: 0, y: 0 });
  const containerRef = useRef(null);
  const indexRef = useRef({ groupIndex: initialGroupIndex, storyIndex: 0 });

  const DURATION = 5000;
  const TICK = 50;

  useEffect(() => {
    indexRef.current = { groupIndex, storyIndex };
  }, [groupIndex, storyIndex]);

  const group = groups[groupIndex];
  const stories = group?.stories || [];
  const story = stories[storyIndex];

  const goNext = useCallback(() => {
    const { groupIndex: gi, storyIndex: si } = indexRef.current;
    const currentStories = groups[gi]?.stories || [];

    if (si < currentStories.length - 1) {
      setStoryIndex(si + 1);
    } else if (gi < groups.length - 1) {
      setGroupIndex(gi + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [groups, onClose]);

  const goPrev = useCallback(() => {
    const { groupIndex: gi, storyIndex: si } = indexRef.current;

    if (si > 0) {
      setStoryIndex(si - 1);
    } else if (gi > 0) {
      const prevStories = groups[gi - 1]?.stories || [];
      setGroupIndex(gi - 1);
      setStoryIndex(prevStories.length - 1);
    }
  }, [groups]);

  // Progress timer
  useEffect(() => {
    setProgress(0);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timerRef.current);
          goNext();
          return 100;
        }
        return prev + (TICK / DURATION) * 100;
      });
    }, TICK);

    return () => clearInterval(timerRef.current);
  }, [groupIndex, storyIndex, goNext]);

  // Keyboard
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goNext, goPrev, onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Touch
  const handleTouchStart = (e) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    clearInterval(timerRef.current);
  };

  const handleTouchEnd = (e) => {
    if (e.target.closest('button')) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;

    if (Math.abs(dy) > 100 && Math.abs(dy) > Math.abs(dx)) {
      onClose();
      return;
    }

    if (Math.abs(dx) > 50) {
      if (dx < 0) goNext();
      else goPrev();
    } else {
      const screenWidth = window.innerWidth;
      if (touchStartRef.current.x < screenWidth / 3) goPrev();
      else goNext();
    }
  };

  // Click — desktop
  const handleClick = (e) => {
    if (e.target.closest('button')) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) goPrev();
    else goNext();
  };

  if (!story) return null;

  const canGoPrev = groupIndex > 0 || storyIndex > 0;
  const canGoNext = groupIndex < groups.length - 1 || storyIndex < stories.length - 1;

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-[480px] mx-auto select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleClick}
      >
        {/* Story image */}
        <img
          src={story.image_url}
          alt={story.title || ''}
          className="w-full h-full object-cover"
          draggable={false}
        />

        {/* Gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Progress bars */}
        <div className="absolute top-3 left-3 right-3 flex gap-1 z-10">
          {stories.map((_, i) => (
            <div key={i} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
              <div
                className="h-full bg-white rounded-full"
                style={{
                  width: i < storyIndex ? '100%' : i === storyIndex ? `${progress}%` : '0%',
                  transition: i === storyIndex ? 'none' : 'width 0.3s ease',
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-7 left-3 right-3 flex items-center gap-3 z-10">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-white shrink-0">
            <img src={group.cover_image} alt="" className="w-full h-full object-cover" />
          </div>
          <span className="text-white text-sm font-semibold truncate">{group.name}</span>
          <button
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="ml-auto w-8 h-8 flex items-center justify-center text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Bottom content */}
        <div className="absolute bottom-6 left-4 right-4 z-10">
          {story.title && (
            <h3 className="text-white text-lg font-bold leading-tight">{story.title}</h3>
          )}
          {story.description && (
            <p className="text-white/80 text-sm mt-1 line-clamp-3">{story.description}</p>
          )}
        </div>

        {/* Nav arrows */}
        {canGoPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 active:bg-black/60 z-10"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}
        {canGoNext && (
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-black/50 active:bg-black/60 z-10"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
