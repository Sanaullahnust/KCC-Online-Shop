import React, { useState, useRef, useEffect, useCallback, TouchEvent, MouseEvent, WheelEvent } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  ChevronLeft, 
  ChevronRight, 
  X, 
  Sparkles,
  Move,
  Eye,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  title?: string;
}

export interface ProductImageViewerProps {
  mediaItems: MediaItem[];
  currentIndex: number;
  onIndexChange: (newIndex: number) => void;
  productName: string;
  className?: string;
  allowFullscreen?: boolean;
}

export function ProductImageViewer({
  mediaItems,
  currentIndex,
  onIndexChange,
  productName,
  className = '',
  allowFullscreen = true,
}: ProductImageViewerProps) {
  const currentMedia = mediaItems[currentIndex] || mediaItems[0];
  const isVideo = currentMedia?.type === 'video';

  // Inline Viewer Zoom & Pan State
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreenOpen, setIsFullscreenOpen] = useState(false);
  const [showHint, setShowHint] = useState(true);

  // Refs for tracking gestures
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{
    dist: number;
    initialScale: number;
    initialPos: { x: 0; y: 0 };
    touchCenter: { x: number; y: number };
    startTouch1: { x: number; y: number };
    startTouch2?: { x: number; y: number };
    lastTapTime: number;
    isPanning: boolean;
  }>({
    dist: 0,
    initialScale: 1,
    initialPos: { x: 0, y: 0 },
    touchCenter: { x: 0, y: 0 },
    startTouch1: { x: 0, y: 0 },
    lastTapTime: 0,
    isPanning: false,
  });

  const mouseStartRef = useRef<{
    startX: number;
    startY: number;
    initialPos: { x: 0; y: 0 };
  }>({ startX: 0, startY: 0, initialPos: { x: 0, y: 0 } });

  // Auto-hide hint after 3.5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHint(false);
    }, 3500);
    return () => clearTimeout(timer);
  }, []);

  // Reset zoom & pan when active media changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  // Clamp position to container bounds based on scale
  const clampPosition = useCallback((pos: { x: number; y: number }, currentScale: number) => {
    if (!containerRef.current || currentScale <= 1) {
      return { x: 0, y: 0 };
    }
    const rect = containerRef.current.getBoundingClientRect();
    const maxPanX = (rect.width * (currentScale - 1)) / 2;
    const maxPanY = (rect.height * (currentScale - 1)) / 2;

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, pos.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, pos.y)),
    };
  }, []);

  // Zoom controls
  const handleZoomIn = () => {
    setScale((prev) => {
      const nextScale = Math.min(prev + 0.5, 4.5);
      setPosition((prevPos) => clampPosition(prevPos, nextScale));
      return nextScale;
    });
    setShowHint(false);
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const nextScale = Math.max(prev - 0.5, 1);
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((prevPos) => clampPosition(prevPos, nextScale));
      }
      return nextScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Double tap / Double click to zoom toggle
  const handleDoubleTap = (clientX: number, clientY: number) => {
    if (isVideo) return;
    setShowHint(false);

    if (scale > 1.2) {
      handleResetZoom();
    } else {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const targetScale = 2.5;

      // Focal point relative to center
      const offsetX = (rect.width / 2 - (clientX - rect.left)) * (targetScale - 1);
      const offsetY = (rect.height / 2 - (clientY - rect.top)) * (targetScale - 1);

      setScale(targetScale);
      setPosition(clampPosition({ x: offsetX, y: offsetY }, targetScale));
    }
  };

  // --- TOUCH EVENT HANDLERS (Mobile Pinch & Pan) ---
  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isVideo) return;
    const touches = e.touches;

    if (touches.length === 2) {
      // Pinch to Zoom start
      const t1 = touches[0];
      const t2 = touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const center = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      touchStartRef.current = {
        ...touchStartRef.current,
        dist,
        initialScale: scale,
        initialPos: { ...position },
        touchCenter: center,
        startTouch1: { x: t1.clientX, y: t1.clientY },
        startTouch2: { x: t2.clientX, y: t2.clientY },
        isPanning: false,
      };
      setShowHint(false);
    } else if (touches.length === 1) {
      const now = Date.now();
      const t = touches[0];
      const timeDiff = now - touchStartRef.current.lastTapTime;

      if (timeDiff < 300 && timeDiff > 40) {
        // Double Tap
        handleDoubleTap(t.clientX, t.clientY);
        touchStartRef.current.lastTapTime = 0;
      } else {
        touchStartRef.current.lastTapTime = now;
        touchStartRef.current.startTouch1 = { x: t.clientX, y: t.clientY };
        touchStartRef.current.initialPos = { ...position };
        touchStartRef.current.isPanning = scale > 1;
      }
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isVideo) return;
    const touches = e.touches;

    if (touches.length === 2) {
      // Multi-touch Pinch to Zoom
      e.preventDefault();
      const t1 = touches[0];
      const t2 = touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const initialDist = touchStartRef.current.dist || 1;

      const scaleFactor = currentDist / initialDist;
      const newScale = Math.min(Math.max(touchStartRef.current.initialScale * scaleFactor, 1), 5);

      // Pan with pinch center
      const currentCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      const deltaX = currentCenter.x - touchStartRef.current.touchCenter.x;
      const deltaY = currentCenter.y - touchStartRef.current.touchCenter.y;

      const newPos = {
        x: touchStartRef.current.initialPos.x + deltaX,
        y: touchStartRef.current.initialPos.y + deltaY,
      };

      setScale(newScale);
      setPosition(clampPosition(newPos, newScale));
      setShowHint(false);
    } else if (touches.length === 1 && scale > 1) {
      // Single touch pan when zoomed in
      e.preventDefault();
      const t = touches[0];
      const deltaX = t.clientX - touchStartRef.current.startTouch1.x;
      const deltaY = t.clientY - touchStartRef.current.startTouch1.y;

      const newPos = {
        x: touchStartRef.current.initialPos.x + deltaX,
        y: touchStartRef.current.initialPos.y + deltaY,
      };

      setPosition(clampPosition(newPos, scale));
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    if (isVideo) return;
    setIsDragging(false);

    // If scaled very close to 1, snap back to 1
    if (scale < 1.08) {
      handleResetZoom();
    } else {
      setPosition((prev) => clampPosition(prev, scale));
    }

    // Swipe to next/prev image when NOT zoomed in
    if (scale <= 1 && e.changedTouches.length === 1 && mediaItems.length > 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.startTouch1.x;
      if (Math.abs(deltaX) > 60) {
        if (deltaX < 0) {
          // Swipe Left -> Next
          onIndexChange((currentIndex + 1) % mediaItems.length);
        } else {
          // Swipe Right -> Prev
          onIndexChange((currentIndex - 1 + mediaItems.length) % mediaItems.length);
        }
      }
    }
  };

  // --- MOUSE EVENT HANDLERS (Desktop Drag, Wheel, Double Click) ---
  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isVideo || scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    mouseStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPos: { ...position },
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const deltaX = e.clientX - mouseStartRef.current.startX;
    const deltaY = e.clientY - mouseStartRef.current.startY;

    const newPos = {
      x: mouseStartRef.current.initialPos.x + deltaX,
      y: mouseStartRef.current.initialPos.y + deltaY,
    };

    setPosition(clampPosition(newPos, scale));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (isVideo) return;
    // Don't hijack vertical page scrolling unless Ctrl/Meta is pressed or scale > 1
    if (e.ctrlKey || e.metaKey || scale > 1) {
      e.preventDefault();
      const zoomDelta = -e.deltaY * 0.003;
      setScale((prev) => {
        const nextScale = Math.min(Math.max(prev + zoomDelta, 1), 5);
        if (nextScale === 1) {
          setPosition({ x: 0, y: 0 });
        } else {
          setPosition((prevPos) => clampPosition(prevPos, nextScale));
        }
        return nextScale;
      });
      setShowHint(false);
    }
  };

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {/* Main Interactive Stage Container */}
      <div 
        ref={containerRef}
        id="product-gallery-viewer-stage"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={(e) => handleDoubleTap(e.clientX, e.clientY)}
        className={`relative aspect-square rounded-3xl overflow-hidden bg-brand-light border border-black/5 shadow-inner select-none touch-none ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
        style={{ touchAction: 'none' }}
      >
        {/* Render Image or Video */}
        {isVideo ? (
          <video 
            src={currentMedia.url}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center origin-center transition-transform duration-75 will-change-transform"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <img
              src={currentMedia?.url}
              alt={productName}
              draggable={false}
              className="w-full h-full object-cover pointer-events-none select-none"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Floating Gesture Guide Pill (Mobile & Desktop) */}
        <AnimatePresence>
          {showHint && !isVideo && scale === 1 && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
            >
              <div className="bg-black/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap border border-white/10">
                <Move size={12} className="text-amber-400" />
                <span>Pinch or double tap to zoom & pan</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Zoom Level Badge Indicator (Visible when zoomed in) */}
        {scale > 1 && !isVideo && (
          <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-full shadow-md border border-white/10 animate-fadeIn">
            <span>{Math.round(scale * 100)}%</span>
            <span className="text-white/60">• Pan Active</span>
          </div>
        )}

        {/* Quick Navigation Arrows (Visible when NOT zoomed in) */}
        {mediaItems.length > 1 && scale <= 1 && (
          <>
            <button
              type="button"
              id="gallery-prev-btn"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange((currentIndex - 1 + mediaItems.length) % mediaItems.length);
              }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-brand-dark flex items-center justify-center shadow-lg backdrop-blur-sm transition-all z-20 active:scale-90 border border-black/5"
              title="Previous item"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              id="gallery-next-btn"
              onClick={(e) => {
                e.stopPropagation();
                onIndexChange((currentIndex + 1) % mediaItems.length);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/85 hover:bg-white text-brand-dark flex items-center justify-center shadow-lg backdrop-blur-sm transition-all z-20 active:scale-90 border border-black/5"
              title="Next item"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}

        {/* Floating Zoom & Inspector Controls Toolbar */}
        {!isVideo && (
          <div 
            className="absolute bottom-3 right-3 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-black/10 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Zoom Out Button */}
            <button
              type="button"
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-1.5 rounded-xl hover:bg-black/10 text-brand-dark disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90"
              title="Zoom Out (-)"
            >
              <ZoomOut size={16} />
            </button>

            {/* Scale Value / Reset Button */}
            {scale > 1 ? (
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 bg-brand-primary text-white rounded-lg font-mono text-[10px] font-bold flex items-center gap-1 shadow-xs active:scale-95 transition-all"
                title="Reset zoom to 100%"
              >
                <RotateCcw size={10} /> 1:1
              </button>
            ) : (
              <span className="px-1 font-mono text-[10px] font-bold text-brand-gray">1x</span>
            )}

            {/* Zoom In Button */}
            <button
              type="button"
              onClick={handleZoomIn}
              disabled={scale >= 4.5}
              className="p-1.5 rounded-xl hover:bg-black/10 text-brand-dark disabled:opacity-30 disabled:hover:bg-transparent transition-all active:scale-90"
              title="Zoom In (+)"
            >
              <ZoomIn size={16} />
            </button>

            {/* Fullscreen Inspector Button */}
            {allowFullscreen && (
              <button
                type="button"
                onClick={() => setIsFullscreenOpen(true)}
                className="p-1.5 rounded-xl bg-brand-light hover:bg-black/10 text-brand-dark transition-all active:scale-90 ml-0.5 border border-black/5"
                title="Fullscreen Image Inspector"
              >
                <Maximize2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Thumbnails Row */}
      {mediaItems.length > 1 && (
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 px-0.5 scrollbar-thin">
          {mediaItems.map((media, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onIndexChange(idx)}
              className={`relative w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                currentIndex === idx 
                  ? 'border-brand-primary ring-2 ring-brand-primary/20 scale-105 shadow-md' 
                  : 'border-black/10 opacity-70 hover:opacity-100'
              }`}
            >
              {media.type === 'video' ? (
                <div className="w-full h-full bg-black/80 flex items-center justify-center text-white">
                  <Sparkles size={18} />
                </div>
              ) : (
                <img src={media.url} alt="" className="w-full h-full object-cover" />
              )}
              {currentIndex === idx && (
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-brand-primary"></span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* FULLSCREEN HIGH-RESOLUTION DETAIL INSPECTOR MODAL */}
      <AnimatePresence>
        {isFullscreenOpen && (
          <FullscreenImageModal
            mediaItems={mediaItems}
            currentIndex={currentIndex}
            onIndexChange={onIndexChange}
            productName={productName}
            onClose={() => setIsFullscreenOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// FULLSCREEN DETAIL INSPECTOR COMPONENT (OPTIMIZED FOR MOBILE PINCH & DRAG)
interface FullscreenImageModalProps {
  mediaItems: MediaItem[];
  currentIndex: number;
  onIndexChange: (idx: number) => void;
  productName: string;
  onClose: () => void;
}

function FullscreenImageModal({
  mediaItems,
  currentIndex,
  onIndexChange,
  productName,
  onClose,
}: FullscreenImageModalProps) {
  const currentMedia = mediaItems[currentIndex] || mediaItems[0];
  const isVideo = currentMedia?.type === 'video';

  const [scale, setScale] = useState(1.5);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartRef = useRef<{
    dist: number;
    initialScale: number;
    initialPos: { x: 0; y: 0 };
    touchCenter: { x: number; y: number };
    startTouch1: { x: number; y: number };
    lastTapTime: number;
  }>({
    dist: 0,
    initialScale: 1.5,
    initialPos: { x: 0, y: 0 },
    touchCenter: { x: 0, y: 0 },
    startTouch1: { x: 0, y: 0 },
    lastTapTime: 0,
  });

  const mouseStartRef = useRef<{
    startX: number;
    startY: number;
    initialPos: { x: 0; y: 0 };
  }>({ startX: 0, startY: 0, initialPos: { x: 0, y: 0 } });

  // Reset when media changes
  useEffect(() => {
    setScale(1.5);
    setPosition({ x: 0, y: 0 });
  }, [currentIndex]);

  const clampPosition = useCallback((pos: { x: number; y: number }, currentScale: number) => {
    if (!containerRef.current || currentScale <= 1) {
      return { x: 0, y: 0 };
    }
    const rect = containerRef.current.getBoundingClientRect();
    const maxPanX = (rect.width * (currentScale - 1)) / 2;
    const maxPanY = (rect.height * (currentScale - 1)) / 2;

    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, pos.x)),
      y: Math.max(-maxPanY, Math.min(maxPanY, pos.y)),
    };
  }, []);

  const handleZoomIn = () => {
    setScale((prev) => {
      const nextScale = Math.min(prev + 0.75, 6);
      setPosition((prevPos) => clampPosition(prevPos, nextScale));
      return nextScale;
    });
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const nextScale = Math.max(prev - 0.75, 1);
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((prevPos) => clampPosition(prevPos, nextScale));
      }
      return nextScale;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleDoubleTap = (clientX: number, clientY: number) => {
    if (isVideo) return;
    if (scale > 1.5) {
      handleResetZoom();
    } else {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const targetScale = 3;
      const offsetX = (rect.width / 2 - (clientX - rect.left)) * (targetScale - 1);
      const offsetY = (rect.height / 2 - (clientY - rect.top)) * (targetScale - 1);

      setScale(targetScale);
      setPosition(clampPosition({ x: offsetX, y: offsetY }, targetScale));
    }
  };

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (isVideo) return;
    const touches = e.touches;

    if (touches.length === 2) {
      const t1 = touches[0];
      const t2 = touches[1];
      const dist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const center = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };

      touchStartRef.current = {
        ...touchStartRef.current,
        dist,
        initialScale: scale,
        initialPos: { ...position },
        touchCenter: center,
        startTouch1: { x: t1.clientX, y: t1.clientY },
      };
    } else if (touches.length === 1) {
      const now = Date.now();
      const t = touches[0];
      const timeDiff = now - touchStartRef.current.lastTapTime;

      if (timeDiff < 300 && timeDiff > 40) {
        handleDoubleTap(t.clientX, t.clientY);
        touchStartRef.current.lastTapTime = 0;
      } else {
        touchStartRef.current.lastTapTime = now;
        touchStartRef.current.startTouch1 = { x: t.clientX, y: t.clientY };
        touchStartRef.current.initialPos = { ...position };
      }
    }
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (isVideo) return;
    const touches = e.touches;

    if (touches.length === 2) {
      e.preventDefault();
      const t1 = touches[0];
      const t2 = touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const initialDist = touchStartRef.current.dist || 1;

      const scaleFactor = currentDist / initialDist;
      const newScale = Math.min(Math.max(touchStartRef.current.initialScale * scaleFactor, 1), 6);

      const currentCenter = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      const deltaX = currentCenter.x - touchStartRef.current.touchCenter.x;
      const deltaY = currentCenter.y - touchStartRef.current.touchCenter.y;

      const newPos = {
        x: touchStartRef.current.initialPos.x + deltaX,
        y: touchStartRef.current.initialPos.y + deltaY,
      };

      setScale(newScale);
      setPosition(clampPosition(newPos, newScale));
    } else if (touches.length === 1 && scale > 1) {
      e.preventDefault();
      const t = touches[0];
      const deltaX = t.clientX - touchStartRef.current.startTouch1.x;
      const deltaY = t.clientY - touchStartRef.current.startTouch1.y;

      const newPos = {
        x: touchStartRef.current.initialPos.x + deltaX,
        y: touchStartRef.current.initialPos.y + deltaY,
      };

      setPosition(clampPosition(newPos, scale));
      setIsDragging(true);
    }
  };

  const handleTouchEnd = (e: TouchEvent<HTMLDivElement>) => {
    setIsDragging(false);
    if (scale < 1.05) {
      handleResetZoom();
    } else {
      setPosition((prev) => clampPosition(prev, scale));
    }

    if (scale <= 1 && e.changedTouches.length === 1 && mediaItems.length > 1) {
      const deltaX = e.changedTouches[0].clientX - touchStartRef.current.startTouch1.x;
      if (Math.abs(deltaX) > 60) {
        if (deltaX < 0) {
          onIndexChange((currentIndex + 1) % mediaItems.length);
        } else {
          onIndexChange((currentIndex - 1 + mediaItems.length) % mediaItems.length);
        }
      }
    }
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (isVideo || scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    mouseStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialPos: { ...position },
    };
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const deltaX = e.clientX - mouseStartRef.current.startX;
    const deltaY = e.clientY - mouseStartRef.current.startY;

    const newPos = {
      x: mouseStartRef.current.initialPos.x + deltaX,
      y: mouseStartRef.current.initialPos.y + deltaY,
    };

    setPosition(clampPosition(newPos, scale));
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (isVideo) return;
    e.preventDefault();
    const zoomDelta = -e.deltaY * 0.003;
    setScale((prev) => {
      const nextScale = Math.min(Math.max(prev + zoomDelta, 1), 6);
      if (nextScale === 1) {
        setPosition({ x: 0, y: 0 });
      } else {
        setPosition((prevPos) => clampPosition(prevPos, nextScale));
      }
      return nextScale;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-lg flex flex-col justify-between select-none"
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 flex items-center justify-between z-30 bg-gradient-to-b from-black/80 to-transparent">
        <div className="flex items-center gap-3 text-white">
          <span className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-amber-400">
            <Eye size={18} />
          </span>
          <div>
            <h3 className="font-bold text-sm text-white line-clamp-1 max-w-[220px] sm:max-w-md">
              {productName}
            </h3>
            <p className="text-[11px] text-white/60 font-mono">
              High-Res Detail Inspector • {Math.round(scale * 100)}% Zoom
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Zoom controls in header */}
          <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md rounded-2xl p-1 border border-white/10">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2 rounded-xl text-white hover:bg-white/20 disabled:opacity-30 transition-all cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut size={18} />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2.5 py-1 text-white font-mono text-xs font-bold hover:bg-white/20 rounded-lg transition-all cursor-pointer"
              title="Reset Zoom"
            >
              {Math.round(scale * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 6}
              className="p-2 rounded-xl text-white hover:bg-white/20 disabled:opacity-30 transition-all cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn size={18} />
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full bg-white/10 hover:bg-white/25 text-white transition-all border border-white/10 cursor-pointer ml-2"
            title="Close Fullscreen"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* Main Fullscreen Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={(e) => handleDoubleTap(e.clientX, e.clientY)}
        className="flex-1 relative flex items-center justify-center overflow-hidden touch-none"
        style={{ touchAction: 'none' }}
      >
        {isVideo ? (
          <video
            src={currentMedia.url}
            controls
            autoPlay
            playsInline
            className="max-w-full max-h-[80vh] object-contain rounded-2xl"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center origin-center will-change-transform"
            style={{
              transform: `translate3d(${position.x}px, ${position.y}px, 0px) scale(${scale})`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            <img
              src={currentMedia.url}
              alt={productName}
              draggable={false}
              className="max-w-full max-h-[85vh] object-contain select-none pointer-events-none drop-shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        )}

        {/* Navigation Arrows */}
        {mediaItems.length > 1 && (
          <>
            <button
              onClick={() => onIndexChange((currentIndex - 1 + mediaItems.length) % mediaItems.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer"
            >
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => onIndexChange((currentIndex + 1) % mediaItems.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center backdrop-blur-md transition-all z-20 cursor-pointer"
            >
              <ChevronRight size={28} />
            </button>
          </>
        )}
      </div>

      {/* Bottom Thumbnails & Gesture Hint */}
      <div className="p-4 sm:p-5 flex flex-col items-center gap-3 z-30 bg-gradient-to-t from-black/80 to-transparent">
        {/* Mobile Pinch Gesture Badge */}
        <div className="flex items-center gap-2 text-white/70 text-xs font-semibold">
          <Move size={14} className="text-amber-400" />
          <span>Pinch with two fingers to zoom up to 600% • Drag to inspect fine textures</span>
        </div>

        {/* Thumbnail Selector Strip */}
        {mediaItems.length > 1 && (
          <div className="flex items-center gap-3 overflow-x-auto max-w-xl pb-1">
            {mediaItems.map((media, idx) => (
              <button
                key={idx}
                onClick={() => onIndexChange(idx)}
                className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                  currentIndex === idx ? 'border-amber-400 scale-110 shadow-lg' : 'border-white/20 opacity-50 hover:opacity-90'
                }`}
              >
                {media.type === 'video' ? (
                  <div className="w-full h-full bg-black/60 flex items-center justify-center text-white">
                    <Sparkles size={16} />
                  </div>
                ) : (
                  <img src={media.url} alt="" className="w-full h-full object-cover" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
